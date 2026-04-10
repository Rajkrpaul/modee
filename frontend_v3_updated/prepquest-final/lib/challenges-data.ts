export type Language = 'javascript' | 'python' | 'java' | 'cpp'

export interface TestCase {
  input: string
  expectedOutput: string
  description?: string
}

export interface CodingChallenge {
  id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  description: string
  examples: { input: string; output: string; explanation?: string }[]
  starterCode: string
  starterCodeByLanguage: Record<Language, string>
  solution?: string
  hints: string[]
  xpReward: number
  timeLimit: number
  completionRate: number
  tags: string[]
  testCases: TestCase[]
}

export const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python',     label: 'Python' },
  { id: 'java',       label: 'Java' },
  { id: 'cpp',        label: 'C++' },
]

export const categories = [
  { id: 'all',                 name: 'All Challenges',       count: 16 },
  { id: 'arrays',              name: 'Arrays',               count: 5 },
  { id: 'strings',             name: 'Strings',              count: 3 },
  { id: 'trees',               name: 'Trees',                count: 2 },
  { id: 'linked-lists',        name: 'Linked Lists',         count: 2 },
  { id: 'dynamic-programming', name: 'Dynamic Programming',  count: 2 },
  { id: 'graphs',              name: 'Graphs',               count: 2 },
]

export const challenges: CodingChallenge[] = [
  {
    id: 'two-sum', title: 'Two Sum', difficulty: 'easy', category: 'arrays',
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
      { input: 'nums = [3,3], target = 6', output: '[0,1]' },
    ],
    starterCode: 'function twoSum(nums, target) {\n  // Your code here\n  \n}',
    starterCodeByLanguage: {
      javascript: 'function twoSum(nums, target) {\n  // Your code here\n  \n}',
      python: 'def two_sum(nums: list[int], target: int) -> list[int]:\n    # Your code here\n    pass',
      java: 'import java.util.*;\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n        return new int[]{};\n    }\n}',
      cpp: '#include <vector>\n#include <unordered_map>\nusing namespace std;\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n        return {};\n    }\n};',
    },
    hints: ['Think about using a hash map', 'For each number, check if (target - number) exists in your map', 'Time complexity can be O(n)'],
    xpReward: 30, timeLimit: 15, completionRate: 78, tags: ['Hash Table', 'Array'],
    testCases: [
      { input: '[2,7,11,15], 9', expectedOutput: '[0,1]' },
      { input: '[3,2,4], 6', expectedOutput: '[1,2]' },
      { input: '[3,3], 6', expectedOutput: '[0,1]' },
    ],
  },
  {
    id: 'valid-parentheses', title: 'Valid Parentheses', difficulty: 'easy', category: 'strings',
    description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    starterCode: 'function isValid(s) {\n  // Your code here\n  \n}',
    starterCodeByLanguage: {
      javascript: 'function isValid(s) {\n  // Your code here\n  \n}',
      python: 'def is_valid(s: str) -> bool:\n    # Your code here\n    pass',
      java: 'class Solution {\n    public boolean isValid(String s) {\n        // Your code here\n        return false;\n    }\n}',
      cpp: '#include <stack>\n#include <string>\nusing namespace std;\nclass Solution {\npublic:\n    bool isValid(string s) {\n        // Your code here\n        return false;\n    }\n};',
    },
    hints: ['Use a stack data structure', 'Push opening brackets, pop for closing brackets', 'Check if the popped bracket matches'],
    xpReward: 25, timeLimit: 10, completionRate: 82, tags: ['Stack', 'String'],
    testCases: [
      { input: '"()"', expectedOutput: 'true' },
      { input: '"()[]{}"', expectedOutput: 'true' },
      { input: '"(]"', expectedOutput: 'false' },
      { input: '"([)]"', expectedOutput: 'false' },
      { input: '"{[]}"', expectedOutput: 'true' },
    ],
  },
  {
    id: 'reverse-linked-list', title: 'Reverse Linked List', difficulty: 'easy', category: 'linked-lists',
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = [1,2]', output: '[2,1]' },
      { input: 'head = []', output: '[]' },
    ],
    starterCode: 'function reverseList(head) {\n  // Your code here\n  \n}',
    starterCodeByLanguage: {
      javascript: '// ListNode is available\nfunction reverseList(head) {\n  // Your code here\n  \n}',
      python: '# class ListNode:\n#     def __init__(self, val=0, next=None): ...\ndef reverse_list(head):\n    # Your code here\n    pass',
      java: '// ListNode class is provided\nclass Solution {\n    public ListNode reverseList(ListNode head) {\n        // Your code here\n        return null;\n    }\n}',
      cpp: '// ListNode struct is provided\nclass Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Your code here\n        return nullptr;\n    }\n};',
    },
    hints: ['Use three pointers: prev, current, next', 'Reverse the direction of each node', 'Consider iterative and recursive approaches'],
    xpReward: 30, timeLimit: 15, completionRate: 75, tags: ['Linked List', 'Recursion'],
    testCases: [
      { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]' },
      { input: '[1,2]', expectedOutput: '[2,1]' },
      { input: '[]', expectedOutput: '[]' },
    ],
  },
  {
    id: 'binary-search', title: 'Binary Search', difficulty: 'easy', category: 'arrays',
    description: "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, return its index. Otherwise, return -1.\n\nYou must write an algorithm with O(log n) runtime complexity.",
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists in nums and its index is 4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1', explanation: '2 does not exist in nums so return -1' },
    ],
    starterCode: 'function search(nums, target) {\n  // Your code here\n  \n}',
    starterCodeByLanguage: {
      javascript: 'function search(nums, target) {\n  // Your code here\n  \n}',
      python: 'def search(nums: list[int], target: int) -> int:\n    # Your code here\n    pass',
      java: 'class Solution {\n    public int search(int[] nums, int target) {\n        // Your code here\n        return -1;\n    }\n}',
      cpp: '#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // Your code here\n        return -1;\n    }\n};',
    },
    hints: ['Use two pointers: left and right', 'Calculate mid and compare with target', 'Adjust left or right based on comparison'],
    xpReward: 25, timeLimit: 10, completionRate: 85, tags: ['Binary Search', 'Array'],
    testCases: [
      { input: '[-1,0,3,5,9,12], 9', expectedOutput: '4' },
      { input: '[-1,0,3,5,9,12], 2', expectedOutput: '-1' },
      { input: '[5], 5', expectedOutput: '0' },
    ],
  },
  {
    id: 'climbing-stairs', title: 'Climbing Stairs', difficulty: 'easy', category: 'dynamic-programming',
    description: 'You are climbing a staircase. It takes n steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    examples: [
      { input: 'n = 2', output: '2', explanation: 'There are two ways: 1+1 and 2.' },
      { input: 'n = 3', output: '3', explanation: 'Three ways: 1+1+1, 1+2, and 2+1.' },
    ],
    starterCode: 'function climbStairs(n) {\n  // Your code here\n  \n}',
    starterCodeByLanguage: {
      javascript: 'function climbStairs(n) {\n  // Your code here\n  \n}',
      python: 'def climb_stairs(n: int) -> int:\n    # Your code here\n    pass',
      java: 'class Solution {\n    public int climbStairs(int n) {\n        // Your code here\n        return 0;\n    }\n}',
      cpp: 'class Solution {\npublic:\n    int climbStairs(int n) {\n        // Your code here\n        return 0;\n    }\n};',
    },
    hints: ['Similar to Fibonacci sequence', 'dp[i] = dp[i-1] + dp[i-2]', 'Can optimize space to O(1)'],
    xpReward: 25, timeLimit: 10, completionRate: 80, tags: ['Dynamic Programming', 'Math'],
    testCases: [
      { input: '2', expectedOutput: '2' },
      { input: '3', expectedOutput: '3' },
      { input: '5', expectedOutput: '8' },
    ],
  },
  {
    id: 'palindrome-string', title: 'Valid Palindrome', difficulty: 'easy', category: 'strings',
    description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string s, return true if it is a palindrome, or false otherwise.',
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true', explanation: '"amanaplanacanalpanama" is a palindrome.' },
      { input: 's = "race a car"', output: 'false' },
    ],
    starterCode: 'function isPalindrome(s) {\n  // Your code here\n  \n}',
    starterCodeByLanguage: {
      javascript: 'function isPalindrome(s) {\n  // Your code here\n  \n}',
      python: 'def is_palindrome(s: str) -> bool:\n    # Your code here\n    pass',
      java: 'class Solution {\n    public boolean isPalindrome(String s) {\n        // Your code here\n        return false;\n    }\n}',
      cpp: '#include <string>\n#include <cctype>\nusing namespace std;\nclass Solution {\npublic:\n    bool isPalindrome(string s) {\n        // Your code here\n        return false;\n    }\n};',
    },
    hints: ['Convert to lowercase and filter alphanumeric characters', 'Use two pointers from both ends', 'Compare characters moving towards center'],
    xpReward: 20, timeLimit: 10, completionRate: 88, tags: ['Two Pointers', 'String'],
    testCases: [
      { input: '"A man, a plan, a canal: Panama"', expectedOutput: 'true' },
      { input: '"race a car"', expectedOutput: 'false' },
      { input: '" "', expectedOutput: 'true' },
    ],
  },
  {
    id: 'merge-intervals', title: 'Merge Intervals', difficulty: 'medium', category: 'arrays',
    description: 'Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
    examples: [
      { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explanation: '[1,3] and [2,6] overlap, merge into [1,6].' },
      { input: 'intervals = [[1,4],[4,5]]', output: '[[1,5]]' },
    ],
    starterCode: 'function merge(intervals) {\n  // Your code here\n  \n}',
    starterCodeByLanguage: {
      javascript: 'function merge(intervals) {\n  // Your code here\n  \n}',
      python: 'def merge(intervals: list[list[int]]) -> list[list[int]]:\n    # Your code here\n    pass',
      java: 'class Solution {\n    public int[][] merge(int[][] intervals) {\n        // Your code here\n        return new int[][]{};\n    }\n}',
      cpp: '#include <vector>\n#include <algorithm>\nusing namespace std;\nclass Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        // Your code here\n        return {};\n    }\n};',
    },
    hints: ['Sort intervals by start time first', 'Compare end of current interval with start of next', 'Merge if overlapping, otherwise add to result'],
    xpReward: 50, timeLimit: 25, completionRate: 62, tags: ['Array', 'Sorting'],
    testCases: [
      { input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]' },
      { input: '[[1,4],[4,5]]', expectedOutput: '[[1,5]]' },
    ],
  },
  {
    id: 'longest-substring', title: 'Longest Substring Without Repeating Characters', difficulty: 'medium', category: 'strings',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", length 3.' },
      { input: 's = "bbbbb"', output: '1' },
      { input: 's = "pwwkew"', output: '3' },
    ],
    starterCode: 'function lengthOfLongestSubstring(s) {\n  // Your code here\n  \n}',
    starterCodeByLanguage: {
      javascript: 'function lengthOfLongestSubstring(s) {\n  // Your code here\n  \n}',
      python: 'def length_of_longest_substring(s: str) -> int:\n    # Your code here\n    pass',
      java: 'class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Your code here\n        return 0;\n    }\n}',
      cpp: '#include <string>\n#include <unordered_set>\nusing namespace std;\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Your code here\n        return 0;\n    }\n};',
    },
    hints: ['Use sliding window technique', 'Use a Set to track characters in current window', 'Move right to expand, left to shrink'],
    xpReward: 50, timeLimit: 25, completionRate: 58, tags: ['Hash Table', 'String', 'Sliding Window'],
    testCases: [
      { input: '"abcabcbb"', expectedOutput: '3' },
      { input: '"bbbbb"', expectedOutput: '1' },
      { input: '"pwwkew"', expectedOutput: '3' },
    ],
  },
  {
    id: 'binary-tree-level-order', title: 'Binary Tree Level Order Traversal', difficulty: 'medium', category: 'trees',
    description: "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' },
      { input: 'root = [1]', output: '[[1]]' },
      { input: 'root = []', output: '[]' },
    ],
    starterCode: 'function levelOrder(root) {\n  // Your code here\n  \n}',
    starterCodeByLanguage: {
      javascript: 'function levelOrder(root) {\n  // Your code here\n  \n}',
      python: 'from collections import deque\ndef level_order(root):\n    # Your code here\n    pass',
      java: 'import java.util.*;\nclass Solution {\n    public List<List<Integer>> levelOrder(TreeNode root) {\n        // Your code here\n        return new ArrayList<>();\n    }\n}',
      cpp: '#include <vector>\n#include <queue>\nusing namespace std;\nclass Solution {\npublic:\n    vector<vector<int>> levelOrder(TreeNode* root) {\n        // Your code here\n        return {};\n    }\n};',
    },
    hints: ['Use BFS with a queue', 'Track number of nodes at each level', 'Process all nodes at current level before moving to next'],
    xpReward: 45, timeLimit: 20, completionRate: 65, tags: ['Tree', 'BFS', 'Binary Tree'],
    testCases: [
      { input: '[3,9,20,null,null,15,7]', expectedOutput: '[[3],[9,20],[15,7]]' },
      { input: '[1]', expectedOutput: '[[1]]' },
    ],
  },
  {
    id: 'coin-change', title: 'Coin Change', difficulty: 'medium', category: 'dynamic-programming',
    description: 'You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount cannot be made up, return -1.',
    examples: [
      { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1' },
      { input: 'coins = [2], amount = 3', output: '-1' },
      { input: 'coins = [1], amount = 0', output: '0' },
    ],
    starterCode: 'function coinChange(coins, amount) {\n  // Your code here\n  \n}',
    starterCodeByLanguage: {
      javascript: 'function coinChange(coins, amount) {\n  // Your code here\n  \n}',
      python: 'def coin_change(coins: list[int], amount: int) -> int:\n    # Your code here\n    pass',
      java: 'class Solution {\n    public int coinChange(int[] coins, int amount) {\n        // Your code here\n        return -1;\n    }\n}',
      cpp: '#include <vector>\n#include <climits>\nusing namespace std;\nclass Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        // Your code here\n        return -1;\n    }\n};',
    },
    hints: ['Use DP with dp array of size amount + 1', 'Initialize with Infinity except dp[0] = 0', 'For each amount, try all coins and find minimum'],
    xpReward: 55, timeLimit: 30, completionRate: 52, tags: ['Dynamic Programming', 'Array', 'BFS'],
    testCases: [
      { input: '[1,2,5], 11', expectedOutput: '3' },
      { input: '[2], 3', expectedOutput: '-1' },
      { input: '[1], 0', expectedOutput: '0' },
    ],
  },
  {
    id: 'number-of-islands', title: 'Number of Islands', difficulty: 'medium', category: 'graphs',
    description: "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
    examples: [
      { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', output: '1' },
      { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: '3' },
    ],
    starterCode: 'function numIslands(grid) {\n  // Your code here\n  \n}',
    starterCodeByLanguage: {
      javascript: 'function numIslands(grid) {\n  // Your code here\n  \n}',
      python: 'def num_islands(grid: list[list[str]]) -> int:\n    # Your code here\n    pass',
      java: 'class Solution {\n    public int numIslands(char[][] grid) {\n        // Your code here\n        return 0;\n    }\n}',
      cpp: '#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        // Your code here\n        return 0;\n    }\n};',
    },
    hints: ['Use DFS or BFS to explore connected land cells', 'Mark visited cells to avoid counting twice', 'Increment island count for each unvisited land cell'],
    xpReward: 50, timeLimit: 25, completionRate: 60, tags: ['Array', 'DFS', 'BFS', 'Union Find'],
    testCases: [
      { input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', expectedOutput: '1' },
      { input: '[["1","1","0"],["0","1","0"],["0","0","1"]]', expectedOutput: '2' },
    ],
  },
  {
    id: 'validate-bst', title: 'Validate Binary Search Tree', difficulty: 'medium', category: 'trees',
    description: 'Given the root of a binary tree, determine if it is a valid binary search tree (BST).\n\nA valid BST: left subtree nodes are less than the node key, right subtree nodes are greater, and both subtrees must also be valid BSTs.',
    examples: [
      { input: 'root = [2,1,3]', output: 'true' },
      { input: 'root = [5,1,4,null,null,3,6]', output: 'false', explanation: 'Right child is 4, which is less than root 5.' },
    ],
    starterCode: 'function isValidBST(root) {\n  // Your code here\n  \n}',
    starterCodeByLanguage: {
      javascript: 'function isValidBST(root) {\n  // Your code here\n  \n}',
      python: 'def is_valid_bst(root) -> bool:\n    # Your code here\n    pass',
      java: 'class Solution {\n    public boolean isValidBST(TreeNode root) {\n        // Your code here\n        return false;\n    }\n}',
      cpp: 'class Solution {\npublic:\n    bool isValidBST(TreeNode* root) {\n        // Your code here\n        return false;\n    }\n};',
    },
    hints: ['Track valid range (min, max) for each node', 'Left child must be less than current, right must be greater', 'Recursively validate both subtrees'],
    xpReward: 45, timeLimit: 20, completionRate: 55, tags: ['Tree', 'DFS', 'Binary Search Tree'],
    testCases: [
      { input: '[2,1,3]', expectedOutput: 'true' },
      { input: '[5,1,4,null,null,3,6]', expectedOutput: 'false' },
    ],
  },
  {
    id: 'word-search', title: 'Word Search', difficulty: 'medium', category: 'graphs',
    description: 'Given an m x n grid of characters board and a string word, return true if word exists in the grid. The word can be constructed from letters of sequentially adjacent cells. The same letter cell may not be used more than once.',
    examples: [
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: 'true' },
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCB"', output: 'false' },
    ],
    starterCode: 'function exist(board, word) {\n  // Your code here\n  \n}',
    starterCodeByLanguage: {
      javascript: 'function exist(board, word) {\n  // Your code here\n  \n}',
      python: 'def exist(board: list[list[str]], word: str) -> bool:\n    # Your code here\n    pass',
      java: 'class Solution {\n    public boolean exist(char[][] board, String word) {\n        // Your code here\n        return false;\n    }\n}',
      cpp: '#include <vector>\n#include <string>\nusing namespace std;\nclass Solution {\npublic:\n    bool exist(vector<vector<char>>& board, string word) {\n        // Your code here\n        return false;\n    }\n};',
    },
    hints: ['Use backtracking with DFS', 'Mark cells as visited during exploration', 'Unmark cells when backtracking'],
    xpReward: 55, timeLimit: 30, completionRate: 48, tags: ['Array', 'Backtracking', 'Matrix'],
    testCases: [
      { input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], "ABCCED"', expectedOutput: 'true' },
      { input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], "ABCB"', expectedOutput: 'false' },
    ],
  },
  {
    id: 'lru-cache', title: 'LRU Cache', difficulty: 'hard', category: 'linked-lists',
    description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the LRUCache class:\n- `LRUCache(int capacity)` Initialize with positive size capacity.\n- `int get(int key)` Return the value if the key exists, otherwise return -1.\n- `void put(int key, int value)` Update or insert. Evict the least recently used key when over capacity.\n\nBoth `get` and `put` must run in O(1) average time complexity.',
    examples: [
      { input: '["LRUCache","put","put","get","put","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]', output: '[null,null,null,1,null,-1,null,-1,3,4]' },
    ],
    starterCode: 'class LRUCache {\n  constructor(capacity) {\n    // Your code here\n  }\n  get(key) {\n    // Your code here\n  }\n  put(key, value) {\n    // Your code here\n  }\n}',
    starterCodeByLanguage: {
      javascript: 'class LRUCache {\n  constructor(capacity) {\n    // Your code here\n  }\n  get(key) {\n    // Your code here\n  }\n  put(key, value) {\n    // Your code here\n  }\n}',
      python: 'class LRUCache:\n    def __init__(self, capacity: int):\n        # Your code here\n        pass\n    def get(self, key: int) -> int:\n        # Your code here\n        pass\n    def put(self, key: int, value: int) -> None:\n        # Your code here\n        pass',
      java: 'import java.util.*;\nclass LRUCache {\n    public LRUCache(int capacity) {\n        // Your code here\n    }\n    public int get(int key) {\n        return -1;\n    }\n    public void put(int key, int value) {\n        // Your code here\n    }\n}',
      cpp: '#include <unordered_map>\n#include <list>\nusing namespace std;\nclass LRUCache {\npublic:\n    LRUCache(int capacity) {\n        // Your code here\n    }\n    int get(int key) {\n        return -1;\n    }\n    void put(int key, int value) {\n        // Your code here\n    }\n};',
    },
    hints: ['Use HashMap + Doubly Linked List', 'HashMap gives O(1) access, LinkedList maintains order', 'Move accessed nodes to front, remove from back when full'],
    xpReward: 80, timeLimit: 45, completionRate: 35, tags: ['Hash Table', 'Linked List', 'Design'],
    testCases: [
      { input: 'capacity=2; put(1,1),put(2,2),get(1),put(3,3),get(2),put(4,4),get(1),get(3),get(4)', expectedOutput: '1,-1,-1,3,4' },
    ],
  },
  {
    id: 'trapping-rain-water', title: 'Trapping Rain Water', difficulty: 'hard', category: 'arrays',
    description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: 'The elevation map can trap 6 units of rain water.' },
      { input: 'height = [4,2,0,3,2,5]', output: '9' },
    ],
    starterCode: 'function trap(height) {\n  // Your code here\n  \n}',
    starterCodeByLanguage: {
      javascript: 'function trap(height) {\n  // Your code here\n  \n}',
      python: 'def trap(height: list[int]) -> int:\n    # Your code here\n    pass',
      java: 'class Solution {\n    public int trap(int[] height) {\n        // Your code here\n        return 0;\n    }\n}',
      cpp: '#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int trap(vector<int>& height) {\n        // Your code here\n        return 0;\n    }\n};',
    },
    hints: ['Water at each position = min(maxLeft, maxRight) - height', 'Precompute max heights from left and right', 'Two pointer approach achieves O(1) space'],
    xpReward: 85, timeLimit: 40, completionRate: 38, tags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack'],
    testCases: [
      { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6' },
      { input: '[4,2,0,3,2,5]', expectedOutput: '9' },
    ],
  },
  {
    id: 'median-of-two-sorted-arrays', title: 'Median of Two Sorted Arrays', difficulty: 'hard', category: 'arrays',
    description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log (m+n)).',
    examples: [
      { input: 'nums1 = [1,3], nums2 = [2]', output: '2.00000', explanation: 'Merged array = [1,2,3] and median is 2.' },
      { input: 'nums1 = [1,2], nums2 = [3,4]', output: '2.50000', explanation: 'Merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.' },
    ],
    starterCode: 'function findMedianSortedArrays(nums1, nums2) {\n  // Your code here\n  \n}',
    starterCodeByLanguage: {
      javascript: 'function findMedianSortedArrays(nums1, nums2) {\n  // Your code here\n  \n}',
      python: 'def find_median_sorted_arrays(nums1: list[int], nums2: list[int]) -> float:\n    # Your code here\n    pass',
      java: 'class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        // Your code here\n        return 0.0;\n    }\n}',
      cpp: '#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        // Your code here\n        return 0.0;\n    }\n};',
    },
    hints: ['Binary search on the smaller array', 'Partition both arrays so left halves combined equal right halves', 'Median from max of left partition and min of right partition'],
    xpReward: 100, timeLimit: 45, completionRate: 30, tags: ['Array', 'Binary Search', 'Divide and Conquer'],
    testCases: [
      { input: '[1,3], [2]', expectedOutput: '2.00000' },
      { input: '[1,2], [3,4]', expectedOutput: '2.50000' },
    ],
  },
]

export const difficultyConfig = {
  easy:   { color: 'text-green-500 bg-green-500/10 border-green-500/30',   xpMultiplier: 1 },
  medium: { color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30', xpMultiplier: 1.5 },
  hard:   { color: 'text-red-500 bg-red-500/10 border-red-500/30',          xpMultiplier: 2 },
}
