DEFAULT_CHALLENGES = [
    {
        "title": "Nyan Overflow",
        "category": "Pwn",
        "difficulty": "Medium",
        "summary": "经典的栈溢出预告，考验你对调用约定的熟悉程度。",
        "content": "经典栈溢出题，帮助猫娘守护服务器。",
        "points": 300,
        "flag": "NekoCTF{stacked_nyan_overflow}",
        "flags": [
            {
                "slug": "user",
                "label": "User Flag",
                "points": 150,
                "flag": "NekoCTF{stacked_nyan_user_escape}",
            },
            {
                "slug": "root",
                "label": "Root Flag",
                "points": 150,
                "flag": "NekoCTF{stacked_nyan_root_escape}",
            },
        ],
        "is_visible": True,
    },
    {
        "title": "Whisker Injection",
        "category": "Web",
        "difficulty": "Easy",
        "summary": "猫薄荷商城后台传出注入异味，快来排查。",
        "content": "从猫薄荷商城后台找到注入点，拿下flag。",
        "points": 200,
        "flag": "NekoCTF{purrfect_sqli}",
        "flags": [
            {
                "slug": "user",
                "label": "User Flag",
                "points": 200,
                "flag": "NekoCTF{purrfect_sqli}",
            },
        ],
        "is_visible": True,
    },
    {
        "title": "Cipher of the Nine Tails",
        "category": "Crypto",
        "difficulty": "Medium",
        "summary": "禁忌的猫尾秘文重现江湖，需要霓虹破译。",
        "content": "破解古老的猫尾加密，揭开禁忌知识。",
        "points": 250,
        "flag": "NekoCTF{nine_tails_cipher_broken}",
        "flags": [
            {
                "slug": "puzzle",
                "label": "Cipher Break",
                "points": 250,
                "flag": "NekoCTF{nine_tails_cipher_broken}",
            },
        ],
        "is_visible": True,
    },
    {
        "title": "Starlit Packet Chase",
        "category": "Misc",
        "difficulty": "Easy",
        "summary": "星空下的包流异常，给夜间巡逻队一点提示。",
        "content": "夜色下的抓包追踪，找出隐藏的猫步踪迹。",
        "points": 150,
        "flag": "NekoCTF{packet_trails_in_the_stars}",
        "flags": [
            {
                "slug": "signal",
                "label": "Signal Trace",
                "points": 150,
                "flag": "NekoCTF{packet_trails_in_the_stars}",
            },
        ],
        "is_visible": True,
    },
]

DEFAULT_ANNOUNCEMENTS = [
    {
        "display_date": "2025.09.18",
        "title": "官网公测上线",
        "category": "公告",
        "description": "NekoCTF 官网正式开放，欢迎提前探索题目与赛事内容。",
        "display_order": 10,
    },
    {
        "display_date": "2025.10.05",
        "title": "题目征集启动",
        "category": "投稿",
        "description": "提交你原创的喵系题面，被选中即可收获特别纪念周边。",
        "display_order": 9,
    },
    {
        "display_date": "2025.11.12",
        "title": "线下沙龙巡回",
        "category": "活动",
        "description": "核心命题团队将在沪深蓉三地举办线下沙龙，欢迎报名参与。",
        "display_order": 8,
    },
]

DEFAULT_EVENT_OVERVIEW = {
    "title": "2025 春季正式赛",
    "date_range": "2025.03.14 - 03.16",
    "location": "线上＋线下联合举办",
    "cta_label": "订阅赛程提醒",
    "cta_link": "/submit",
    "cta_note": "订阅赛程后将率先收到题目发布提醒、线下活动报名链接与特别礼物。",
}

DEFAULT_HIGHLIGHT_CARDS = [
    {
        "label": "公开赛题",
        "metric_key": "visible_challenges",
        "note": "赛事开启后将全面解锁",
        "display_order": 1,
    },
    {
        "label": "注册选手",
        "metric_key": "total_players",
        "note": "猫耳战队规模持续增长",
        "display_order": 2,
    },
    {
        "label": "累计提交",
        "metric_key": "total_submissions",
        "note": "包含所有尝试与成功",
        "display_order": 3,
    },
    {
        "label": "成功解题",
        "metric_key": "total_solves",
        "note": "记录每一次灵光乍现",
        "display_order": 4,
    },
]

DEFAULT_SITE_SETTINGS = {
    "home.leaderboard.placeholder_primary": "等待登场",
    "home.leaderboard.placeholder_secondary": "期待你的加入",
    "home.leaderboard.tagline": "想要上榜？完成任意题目即可累计积分，登录后台查看详细成绩。",
    "home.contact.cta_email": "hi@nekoctf.com",
}

DEFAULT_CATEGORIES = [
    {
        "value": "Web",
        "label": "Web",
        "description": "Web 安全、注入与逻辑漏洞挑战。",
        "display_order": 100,
    },
    {
        "value": "Pwn",
        "label": "Pwn",
        "description": "缓冲区溢出、利用链与系统调试。",
        "display_order": 90,
    },
    {
        "value": "Crypto",
        "label": "Crypto",
        "description": "密码学协议、古典密码与现代算法。",
        "display_order": 80,
    },
    {
        "value": "Reverse",
        "label": "Reverse",
        "description": "逆向工程、二进制分析与解构。",
        "display_order": 70,
    },
    {
        "value": "Forensics",
        "label": "Forensics",
        "description": "取证分析、日志追踪与人工制图。",
        "display_order": 60,
    },
    {
        "value": "Misc",
        "label": "Misc",
        "description": "杂项题型、灵感迸发的跨界挑战。",
        "display_order": 50,
    },
    {
        "value": "Mobile",
        "label": "Mobile",
        "description": "移动端安全、应用逆向与抓包。",
        "display_order": 40,
    },
    {
        "value": "OSINT",
        "label": "OSINT",
        "description": "公开情报收集与线索推理。",
        "display_order": 30,
    },
]

DEFAULT_DIFFICULTIES = [
    {"value": "Beginner", "label": "入门", "display_order": 10},
    {"value": "Easy", "label": "简单", "display_order": 9},
    {"value": "Medium", "label": "中等", "display_order": 8},
    {"value": "Hard", "label": "困难", "display_order": 7},
    {"value": "Insane", "label": "疯狂", "display_order": 6},
]
