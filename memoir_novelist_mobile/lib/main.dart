import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

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
  final String apiBase = 'http://127.0.0.1:8000'; // 開發環境 (模擬器可能需要 10.0.2.2)

  // 頁面列表
  late List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    _pages = [
      const BookcasePage(),
      const DiariesPage(),
      const AlchemistPage(),
    ];
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
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(FontAwesomeIcons.book),
            label: '書架',
          ),
          NavigationDestination(
            icon: Icon(FontAwesomeIcons.penNib),
            label: '日記',
          ),
          NavigationDestination(
            icon: Icon(FontAwesomeIcons.wandMagicSparkles),
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

  Future<void> fetchNovels() async {
    try {
      final res = await http.get(Uri.parse('http://127.0.0.1:8000/novels'));
      if (res.statusCode == 200) {
        setState(() {
          novels = json.decode(utf8.decode(res.bodyBytes));
          isLoading = false;
        });
      }
    } catch (e) {
      print('載入失敗: $e');
    }
  }

  @override
  void initState() {
    super.initState();
    fetchNovels();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('珍藏的回憶'), centerTitle: true),
      body: isLoading 
        ? const Center(child: CircularProgressIndicator())
        : ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: novels.length,
            itemBuilder: (context, index) {
              final novel = novels[index];
              return Card(
                elevation: 0,
                shape: RoundedRectangleBorder(
                  side: BorderSide(color: Colors.grey.shade200),
                  borderRadius: BorderRadius.circular(20),
                ),
                margin: const EdgeInsets.bottom(16),
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
                              style: const TextStyle(fontSize: 10, color: Color(0xFF8B4513), fontWeight: FontWeight.bold),
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
                      TextButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => NovelDetailPage(novel: novel)),
                          );
                        },
                        child: const Text('閱讀全文 →', style: TextStyle(color: Color(0xFF8B4513))),
                      ),
                    ],
                  ),
                ),
              );
            },
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
                    style: TextStyle(letterSpacing: 4, color: Colors.amber.shade800, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    novel['title'],
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, height: 1.2),
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

  Future<void> fetchDiaries() async {
    try {
      final res = await http.get(Uri.parse('http://127.0.0.1:8000/diaries'));
      if (res.statusCode == 200) {
        setState(() {
          diaries = json.decode(utf8.decode(res.bodyBytes));
        });
      }
    } catch (e) {
      print('載入日記失敗: $e');
    }
  }

  Future<void> addDiary() async {
    if (_controller.text.isEmpty) return;
    try {
      await http.post(
        Uri.parse('http://127.0.0.1:8000/diaries'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'content': _controller.text}),
      );
      _controller.clear();
      fetchDiaries();
    } catch (e) {
      print('新增失敗: $e');
    }
  }

  @override
  void initState() {
    super.initState();
    fetchDiaries();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('時空碎片'), centerTitle: true),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _controller,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: '記下此刻的感受...',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(15)),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.send),
                  onPressed: addDiary,
                ),
              ),
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: diaries.length,
              itemBuilder: (context, index) {
                final diary = diaries[index];
                return ListTile(
                  title: Text(diary['content']),
                  subtitle: Text(DateFormat('yyyy-MM-dd').format(DateTime.parse(diary['created_at']))),
                );
              },
            ),
          ),
        ],
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

  @override
  void initState() {
    super.initState();
    fetchDiaries();
  }

  Future<void> fetchDiaries() async {
    try {
      final res = await http.get(Uri.parse('http://127.0.0.1:8000/diaries'));
      if (res.statusCode == 200) {
        setState(() {
          diaries = json.decode(utf8.decode(res.bodyBytes));
        });
      }
    } catch (e) {
      print('載入失敗: $e');
    }
  }

  Future<void> generate() async {
    if (selectedIds.isEmpty) return;
    setState(() => isGenerating = true);
    try {
      await http.post(
        Uri.parse('http://127.0.0.1:8000/novels/generate'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'diary_ids': selectedIds,
          'genre': genre,
          'user_role': userRole,
          'protagonist_name': protagonistName,
        }),
      );
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('煉金成功！')));
    } catch (e) {
      print('生成失敗: $e');
    } finally {
      setState(() => isGenerating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('回憶煉金室'), centerTitle: true),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('設定世界觀', style: TextStyle(fontWeight: FontWeight.bold)),
            Wrap(
              spacing: 8,
              children: ['現代都會', '古裝仙俠', '星際科幻', '青春校園'].map((g) {
                return ChoiceChip(
                  label: Text(g),
                  selected: genre == g,
                  onSelected: (val) => setState(() => genre = g),
                );
              }).toList(),
            ),
            const SizedBox(height: 20),
            const Text('選取記憶素材', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            ...diaries.map((d) {
              return CheckboxListTile(
                title: Text(d['content'], maxLines: 1, overflow: TextOverflow.ellipsis),
                value: selectedIds.contains(d['id']),
                onChanged: (val) {
                  setState(() {
                    if (val!) {
                      selectedIds.add(d['id']);
                    } else {
                      selectedIds.remove(d['id']);
                    }
                  });
                },
              );
            }).toList(),
            const SizedBox(height: 30),
            SizedBox(
              width: double.infinity,
              height: 60,
              child: ElevatedButton.icon(
                icon: isGenerating ? const CircularProgressIndicator() : const Icon(FontAwesomeIcons.wandMagicSparkles),
                label: Text(isGenerating ? '煉金中...' : '啟動煉金'),
                onPressed: isGenerating ? null : generate,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF8B4513),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
