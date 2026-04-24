import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import 'package:intl/intl.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

// --- 設定區：請依環境修改 ---
const String apiBase = String.fromEnvironment('API_BASE', defaultValue: 'http://10.0.2.2:8000');
const String apiToken = String.fromEnvironment('API_TOKEN', defaultValue: '');

Map<String, String> get _headers {
  final h = {'Content-Type': 'application/json'};
  if (apiToken.isNotEmpty) h['Authorization'] = 'Bearer $apiToken';
  return h;
}

// HTTP Client 加上 timeout
Future<http.Response> _get(String path) async {
  return await http
      .get(Uri.parse('$apiBase$path'), headers: _headers)
      .timeout(const Duration(seconds: 15));
}

Future<http.Response> _post(String path, dynamic body) async {
  return await http
      .post(
        Uri.parse('$apiBase$path'),
        headers: _headers,
        body: json.encode(body),
      )
      .timeout(const Duration(seconds: 30));
}

Future<http.Response> _delete(String path) async {
  return await http
      .delete(Uri.parse('$apiBase$path'), headers: _headers)
      .timeout(const Duration(seconds: 15));
}

void main() {
  runApp(const MemoirNovelistApp());
}

class MemoirNovelistApp extends StatelessWidget {
  const MemoirNovelistApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '回憶小說家',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF8B4513),
          brightness: Brightness.light,
        ),
        textTheme: GoogleFonts.loraTextTheme(),
      ),
      home: const MainNavigationScreen(),
    );
  }
}

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _selectedIndex = 0;

  // 使用 GlobalKey 讓頁面可以透過外部觸發 refresh
  final _bookcaseKey = GlobalKey<_BookcasePageState>();
  final _diariesKey = GlobalKey<_DiariesPageState>();
  final _alchemistKey = GlobalKey<_AlchemistPageState>();

  late final List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    _pages = [
      BookcasePage(key: _bookcaseKey),
      DiariesPage(key: _diariesKey),
      AlchemistPage(key: _alchemistKey),
    ];
  }

  void _refreshAll() {
    _bookcaseKey.currentState?.refresh();
    _diariesKey.currentState?.refresh();
    _alchemistKey.currentState?.refresh();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: _pages,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (int index) {
          setState(() {
            _selectedIndex = index;
          });
          // 切換到煉金頁時刷新日記列表
          if (index == 2) {
            _alchemistKey.currentState?.refresh();
          }
        },
        destinations: const [
          NavigationDestination(
            icon: FaIcon(FontAwesomeIcons.book),
            label: '書架',
          ),
          NavigationDestination(
            icon: FaIcon(FontAwesomeIcons.penNib),
            label: '日記',
          ),
          NavigationDestination(
            icon: FaIcon(FontAwesomeIcons.wandMagicSparkles),
            label: '煉金',
          ),
        ],
      ),
    );
  }
}

// --- 1. 回憶書架頁面 ---
class BookcasePage extends StatefulWidget {
  const BookcasePage({super.key});

  @override
  State<BookcasePage> createState() => _BookcasePageState();
}

class _BookcasePageState extends State<BookcasePage> {
  List novels = [];
  bool isLoading = true;
  String? errorMsg;

  Future<void> fetchNovels() async {
    if (!mounted) return;
    setState(() => isLoading = true);
    try {
      final res = await _get('/novels');
      if (!mounted) return;
      if (res.statusCode == 200) {
        setState(() {
          novels = json.decode(utf8.decode(res.bodyBytes));
          isLoading = false;
          errorMsg = null;
        });
      } else if (res.statusCode == 401) {
        setState(() {
          isLoading = false;
          errorMsg = '未登入，請設定 API_TOKEN';
        });
      } else {
        setState(() {
          isLoading = false;
          errorMsg = '載入失敗 (${res.statusCode})';
        });
      }
    } on TimeoutException {
      if (!mounted) return;
      setState(() {
        isLoading = false;
        errorMsg = '連線超時，請檢查網路';
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        isLoading = false;
        errorMsg = '載入失敗: $e';
      });
    }
  }

  Future<void> deleteNovel(int id) async {
    try {
      final res = await _delete('/novels/$id');
      if (res.statusCode == 200 || res.statusCode == 204) {
        if (!mounted) return;
        setState(() => novels.removeWhere((n) => n['id'] == id));
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('故事已刪除')),
        );
      } else {
        throw Exception('status ${res.statusCode}');
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('刪除失敗: $e')),
      );
    }
  }

  void refresh() => fetchNovels();

  @override
  void initState() {
    super.initState();
    fetchNovels();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('珍藏的回憶'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: fetchNovels,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: fetchNovels,
        child: _buildBody(),
      ),
    );
  }

  Widget _buildBody() {
    if (isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (errorMsg != null) {
      return ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          SizedBox(
            height: MediaQuery.of(context).size.height * 0.6,
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(errorMsg!, style: TextStyle(color: Colors.red.shade400)),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: fetchNovels,
                    child: const Text('重試'),
                  ),
                ],
              ),
            ),
          ),
        ],
      );
    }
    if (novels.isEmpty) {
      return ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          SizedBox(
            height: MediaQuery.of(context).size.height * 0.6,
            child: const Center(child: Text('書架還是空的')),
          ),
        ],
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: novels.length,
      itemBuilder: (context, index) {
        final novel = novels[index];
        return NovelCard(
          novel: novel,
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => NovelDetailPage(novel: novel)),
          ),
          onDelete: () => _confirmDelete(novel),
        );
      },
    );
  }

  void _confirmDelete(dynamic novel) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('刪除故事'),
        content: Text('確定要刪除「${novel['title']}」嗎？'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('取消'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              deleteNovel(novel['id']);
            },
            child: const Text('刪除', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}

class NovelCard extends StatelessWidget {
  final dynamic novel;
  final VoidCallback onTap;
  final VoidCallback onDelete;

  const NovelCard({
    super.key,
    required this.novel,
    required this.onTap,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Dismissible(
      key: ValueKey(novel['id']),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        decoration: BoxDecoration(
          color: Colors.red.shade400,
          borderRadius: BorderRadius.circular(20),
        ),
        child: const Icon(Icons.delete, color: Colors.white),
      ),
      onDismissed: (_) => onDelete(),
      child: Card(
        elevation: 0,
        shape: RoundedRectangleBorder(
          side: BorderSide(color: Colors.grey.shade200),
          borderRadius: BorderRadius.circular(20),
        ),
        margin: const EdgeInsets.only(bottom: 16),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.amber.shade50,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '${novel['genre']} · ${novel['user_role']}',
                        style: const TextStyle(
                          fontSize: 10,
                          color: Color(0xFF8B4513),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    Text(
                      DateFormat('MM/dd').format(DateTime.parse(novel['created_at'])),
                      style: TextStyle(fontSize: 12, color: Colors.grey.shade400),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  novel['title'],
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  novel['full_content'],
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(color: Colors.grey.shade600, height: 1.5),
                ),
                const SizedBox(height: 12),
                const Text(
                  '閱讀全文 →',
                  style: TextStyle(color: Color(0xFF8B4513), fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class NovelDetailPage extends StatelessWidget {
  final dynamic novel;
  const NovelDetailPage({super.key, required this.novel});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(novel['genre']),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Column(
                children: [
                  Text(
                    '—— ${novel['user_role']} ——',
                    style: TextStyle(
                      letterSpacing: 4,
                      color: Colors.amber.shade800,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    novel['title'],
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Container(width: 40, height: 2, color: Colors.grey.shade300),
                ],
              ),
            ),
            const SizedBox(height: 40),
            Text(
              novel['full_content'],
              style: const TextStyle(fontSize: 18, height: 1.8, color: Color(0xFF2D2D2D)),
            ),
            const SizedBox(height: 60),
            Center(
              child: Text(
                '全篇完',
                style: TextStyle(color: Colors.grey.shade400, letterSpacing: 8),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}

// --- 2. 靈感日記頁面 ---
class DiariesPage extends StatefulWidget {
  const DiariesPage({super.key});

  @override
  State<DiariesPage> createState() => _DiariesPageState();
}

class _DiariesPageState extends State<DiariesPage> {
  List diaries = [];
  final TextEditingController _controller = TextEditingController();
  bool isLoading = true;
  String? errorMsg;
  bool _isSubmitting = false;

  Future<void> fetchDiaries() async {
    if (!mounted) return;
    setState(() => isLoading = true);
    try {
      final res = await _get('/diaries');
      if (!mounted) return;
      if (res.statusCode == 200) {
        setState(() {
          diaries = json.decode(utf8.decode(res.bodyBytes));
          isLoading = false;
          errorMsg = null;
        });
      } else if (res.statusCode == 401) {
        setState(() {
          isLoading = false;
          errorMsg = '未登入，請設定 API_TOKEN';
        });
      } else {
        setState(() {
          isLoading = false;
          errorMsg = '載入失敗 (${res.statusCode})';
        });
      }
    } on TimeoutException {
      if (!mounted) return;
      setState(() {
        isLoading = false;
        errorMsg = '連線超時，請檢查網路';
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        isLoading = false;
        errorMsg = '載入日記失敗: $e';
      });
    }
  }

  Future<void> addDiary() async {
    if (_controller.text.isEmpty || _isSubmitting) return;
    setState(() => _isSubmitting = true);
    try {
      final res = await _post('/diaries', {'content': _controller.text});
      if (!mounted) return;
      if (res.statusCode == 200 || res.statusCode == 201) {
        _controller.clear();
        fetchDiaries();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('記憶已封存')),
        );
      } else {
        throw Exception('status ${res.statusCode}');
      }
    } on TimeoutException {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('連線超時，請稍後再試')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('新增失敗: $e')),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  Future<void> deleteDiary(int id) async {
    try {
      final res = await _delete('/diaries/$id');
      if (res.statusCode == 200 || res.statusCode == 204) {
        if (!mounted) return;
        setState(() => diaries.removeWhere((d) => d['id'] == id));
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('日記已刪除')),
        );
      } else {
        throw Exception('status ${res.statusCode}');
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('刪除失敗: $e')),
      );
    }
  }

  void refresh() => fetchDiaries();

  @override
  void initState() {
    super.initState();
    fetchDiaries();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('時空碎片'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: fetchDiaries,
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _controller,
              maxLines: 3,
              textInputAction: TextInputAction.done,
              onSubmitted: (_) => addDiary(),
              decoration: InputDecoration(
                hintText: '記下此刻的感受...',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(15)),
                suffixIcon: _isSubmitting
                    ? const Padding(
                        padding: EdgeInsets.all(12),
                        child: SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                      )
                    : IconButton(
                        icon: const Icon(Icons.send),
                        onPressed: addDiary,
                      ),
              ),
            ),
          ),
          if (errorMsg != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Expanded(child: Text(errorMsg!, style: TextStyle(color: Colors.red.shade400))),
                  TextButton(onPressed: fetchDiaries, child: const Text('重試')),
                ],
              ),
            ),
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: fetchDiaries,
                    child: diaries.isEmpty
                        ? ListView(
                            physics: const AlwaysScrollableScrollPhysics(),
                            children: [
                              SizedBox(
                                height: MediaQuery.of(context).size.height * 0.4,
                                child: const Center(child: Text('還沒有日記，寫下第一則吧！')),
                              ),
                            ],
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            itemCount: diaries.length,
                            itemBuilder: (context, index) {
                              final diary = diaries[index];
                              return DiaryCard(
                                diary: diary,
                                onDelete: () => deleteDiary(diary['id']),
                              );
                            },
                          ),
                  ),
          ),
        ],
      ),
    );
  }
}

class DiaryCard extends StatelessWidget {
  final dynamic diary;
  final VoidCallback onDelete;

  const DiaryCard({super.key, required this.diary, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return Dismissible(
      key: ValueKey(diary['id']),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        margin: const EdgeInsets.only(bottom: 8),
        decoration: BoxDecoration(
          color: Colors.red.shade400,
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Icon(Icons.delete, color: Colors.white),
      ),
      onDismissed: (_) => onDelete(),
      child: Card(
        elevation: 0,
        margin: const EdgeInsets.only(bottom: 8),
        shape: RoundedRectangleBorder(
          side: BorderSide(color: Colors.grey.shade200),
          borderRadius: BorderRadius.circular(12),
        ),
        child: ListTile(
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          title: Text(
            diary['content'],
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
          ),
          subtitle: Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(
              DateFormat('yyyy-MM-dd HH:mm').format(DateTime.parse(diary['created_at'])),
              style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
            ),
          ),
        ),
      ),
    );
  }
}

// --- 3. 煉金室頁面 ---
class AlchemistPage extends StatefulWidget {
  const AlchemistPage({super.key});

  @override
  State<AlchemistPage> createState() => _AlchemistPageState();
}

class _AlchemistPageState extends State<AlchemistPage> {
  String genre = '現代都會';
  String userRole = '主角';
  String protagonistName = '';
  List<int> selectedIds = [];
  List diaries = [];
  bool isGenerating = false;
  bool isLoadingDiaries = true;
  String? errorMsg;

  final List<String> _genres = ['現代都會', '古裝仙俠', '星際科幻', '青春校園', '賽博龐克', '克蘇魯'];
  final List<String> _roles = ['主角', '配角', '反派', '路人'];

  @override
  void initState() {
    super.initState();
    fetchDiaries();
  }

  Future<void> fetchDiaries() async {
    if (!mounted) return;
    setState(() => isLoadingDiaries = true);
    try {
      final res = await _get('/diaries');
      if (!mounted) return;
      if (res.statusCode == 200) {
        setState(() {
          diaries = json.decode(utf8.decode(res.bodyBytes));
          isLoadingDiaries = false;
          errorMsg = null;
        });
      } else if (res.statusCode == 401) {
        setState(() {
          isLoadingDiaries = false;
          errorMsg = '未登入，請設定 API_TOKEN';
        });
      } else {
        setState(() {
          isLoadingDiaries = false;
          errorMsg = '載入失敗 (${res.statusCode})';
        });
      }
    } on TimeoutException {
      if (!mounted) return;
      setState(() {
        isLoadingDiaries = false;
        errorMsg = '連線超時，請檢查網路';
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        isLoadingDiaries = false;
        errorMsg = '載入失敗: $e';
      });
    }
  }

  Future<void> generate() async {
    if (selectedIds.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('請先選取日記素材')),
      );
      return;
    }
    setState(() => isGenerating = true);
    try {
      final res = await _post('/novels/generate', {
        'diary_ids': selectedIds,
        'genre': genre,
        'user_role': userRole,
        'protagonist_name': protagonistName.isEmpty ? '無名氏' : protagonistName,
      });
      if (!mounted) return;
      if (res.statusCode == 200 || res.statusCode == 201) {
        json.decode(utf8.decode(res.bodyBytes));
        setState(() => selectedIds = []);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('煉金成功！')),
        );
        // 導航到書架頁面並刷新
        if (context.mounted) {
          final navState = context.findAncestorStateOfType<_MainNavigationScreenState>();
          navState?._refreshAll();
        }
      } else {
        throw Exception('status ${res.statusCode}');
      }
    } on TimeoutException {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('連線超時，請稍後再試')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('生成失敗: $e')),
      );
    } finally {
      if (mounted) setState(() => isGenerating = false);
    }
  }

  void refresh() => fetchDiaries();

  void _toggleSelection(int id, bool? selected) {
    setState(() {
      if (selected == true) {
        if (!selectedIds.contains(id)) selectedIds = [...selectedIds, id];
      } else {
        selectedIds = selectedIds.where((i) => i != id).toList();
      }
    });
  }

  void _selectAll(bool select) {
    setState(() {
      selectedIds = select ? diaries.map<int>((d) => d['id'] as int).toList() : [];
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('回憶煉金室'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: fetchDiaries,
          ),
        ],
      ),
      body: isLoadingDiaries
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: fetchDiaries,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (errorMsg != null)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Row(
                          children: [
                            Expanded(child: Text(errorMsg!, style: TextStyle(color: Colors.red.shade400))),
                            TextButton(onPressed: fetchDiaries, child: const Text('重試')),
                          ],
                        ),
                      ),
                    // 世界觀設定
                    const Text('設定世界觀', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: _genres.map((g) {
                        final isSelected = genre == g;
                        return ChoiceChip(
                          label: Text(g),
                          selected: isSelected,
                          selectedColor: Colors.amber.shade100,
                          onSelected: (_) => setState(() => genre = g),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 20),
                    // 角色設定
                    const Text('你的身份', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: _roles.map((r) {
                        return ChoiceChip(
                          label: Text(r),
                          selected: userRole == r,
                          selectedColor: Colors.amber.shade100,
                          onSelected: (_) => setState(() => userRole = r),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 20),
                    // 主角姓名
                    const Text('主角姓名', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 8),
                    TextField(
                      decoration: InputDecoration(
                        hintText: '你的名字...',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                      onChanged: (v) => protagonistName = v,
                    ),
                    const SizedBox(height: 24),
                    // 素材選擇
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('選取記憶素材', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        if (diaries.isNotEmpty)
                          TextButton(
                            onPressed: () => _selectAll(selectedIds.length != diaries.length),
                            child: Text(selectedIds.length == diaries.length ? '清空全選' : '全選素材'),
                          ),
                      ],
                    ),
                    Text(
                      '已選 ${selectedIds.length} 則',
                      style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                    ),
                    const SizedBox(height: 10),
                    if (diaries.isEmpty)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 24),
                        child: Center(child: Text('目前沒有日記可選，先去靈感筆記記錄吧...')),
                      )
                    else
                      ...diaries.map((d) {
                        return CheckboxListTile(
                          contentPadding: EdgeInsets.zero,
                          title: Text(
                            d['content'],
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          subtitle: Text(
                            DateFormat('yyyy-MM-dd').format(DateTime.parse(d['created_at'])),
                            style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                          ),
                          value: selectedIds.contains(d['id']),
                          onChanged: (val) => _toggleSelection(d['id'], val),
                        );
                      }),
                    const SizedBox(height: 30),
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton.icon(
                        icon: isGenerating
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2,
                                ),
                              )
                            : const FaIcon(FontAwesomeIcons.wandMagicSparkles, size: 18),
                        label: Text(isGenerating ? '煉金中...' : '啟動煉金'),
                        onPressed: isGenerating ? null : generate,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF8B4513),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                          textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
    );
  }
}
