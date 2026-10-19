---
title: "Blog Dev Diary 1"
description: "The first development diary entry for this blog"
pubDate: "2026-02-08"
heroImage: "KSC-20261013-PH-SPX01_0007~orig.jpg"
tags: ["blogging", "coding"]
category: "Tech"
---

Welcome to my blog! This post is a quick look at how building it went.

Honestly, the tech stack behind this blog isn't complicated. It's just a pile of Astro; you can check the repo yourself. And as everyone knows, Gemini 3 Pro is already really good at frontend work, so the only real problem was how to make it look good enough and different from everyone else's. (I'm truly sick of flat design.)

My solution was pretty simple: have Gemini generate a few more design styles. In the end I went with my own taste and picked a Modernist style. (Dark mode actually uses Nord Forest.)

That said, standard Modernism gets monotonous and looks a lot like some Chinese government agency websites: stiff and not especially pretty. So on top of it I added a lot of motion and faded the borders way down. Then I tucked a fairly standard easter egg into the background, and it doesn't feel so monotonous anymore.

As of writing this, I still haven't figured out how to fit a friend-links wall in. Hopefully I'll come up with a good idea later.

The fun part is that the "BF's status" box in the bottom-left corner really is my personal status. It runs on Apple Shortcuts + Automation and is stored in Cloudflare KV (pretending to be backend-free). If you want to do the same on Android, check out Captain Kelimu's video. The mysterious stalker box has arrived, everybody run!

I originally picked Astro after watching Denghuoju's videos and thinking Astro sites looked so cool. ~~Then I realized they looked cool because the author is just really skilled.~~
