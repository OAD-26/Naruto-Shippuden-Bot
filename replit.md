# Naruto Shippuden WhatsApp Bot

## Overview

This is a WhatsApp bot built using the Baileys library (@whiskeysockets/baileys) with a Naruto Shippuden theme. The bot provides various commands including group management, AI chat, media downloading, sticker creation, and entertainment features. It runs as a Node.js application with an Express web server for keep-alive functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Core Components

**Bot Framework**
- Uses @whiskeysockets/baileys for WhatsApp Web API connectivity
- Multi-file authentication state management for session persistence
- Command-based architecture with separate files per command in the `/Command` directory

**Web Server**
- Express.js server running on port 3000 for health checks
- Self-ping mechanism every 5 minutes to prevent idle shutdown on hosting platforms

**Command Structure**
- Commands are organized by function (admin, group management, fun, media, AI)
- Three permission tiers: owner-only, admin-only, and everyone commands
- Commands use a prefix system (default: "!" or ".")

### Key Architectural Decisions

**Modular Command System**
- Each command is a separate JavaScript file in `/Command`
- Commands export either an async function or an object with `name`, `description`, and `execute` properties
- This allows easy addition/removal of features without modifying core code

**Data Persistence**
- JSON files in `/data` directory store configuration (antilink, welcomer, group settings)
- File-based storage rather than database for simplicity
- Session data stored in auth_info directory

**Media Processing**
- FFmpeg used for video/image to sticker conversions
- Sharp library for image manipulation (blur, resize)
- Temporary files stored in `/tmp` or `/temp` directories with cleanup routines

**Group Management**
- Admin detection via `lib/isAdmin.js` helper
- Anti-link, anti-spam, and anti-delete features per group
- Welcome/goodbye messages with customizable templates

### Directory Structure

```
/Command - Individual command handlers
/lib - Utility functions (admin check, message config, store)
/data - JSON configuration files
/Assets - Static images for bot responses
/tmp, /temp - Temporary media files
```

## External Dependencies

**WhatsApp Connection**
- @whiskeysockets/baileys - WhatsApp Web API client
- qrcode-terminal - QR code display for authentication

**Web Server**
- Express.js - HTTP server for keep-alive endpoint
- Axios - HTTP client for external API calls

**Media Processing**
- FFmpeg (system dependency) - Video/audio conversion
- Sharp - Image processing
- node-webpmux - WebP sticker creation with metadata

**External APIs**
- Various AI APIs (shizoapi, zellapi) for chatbot responses
- Giphy API for GIF searches
- Google Books API for novel information
- NewsAPI for news headlines
- Instagram/Facebook download APIs via ruhend-scraper

**Logging**
- Pino - Fast JSON logger

**Configuration**
- Settings stored in `settings.js` including owner numbers, bot name, and API keys
- Environment variable `PORT` for web server port