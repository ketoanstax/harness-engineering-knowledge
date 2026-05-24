'use strict';

const { Plugin, Notice, TFile, MarkdownView, Modal } = require('obsidian');

const CONFIG = {
  journalFolder: '1-Journal',
  inboxFolder: '0-Inbox',
};

// =============================================================================
// HELPERS
// =============================================================================
function toSlug(str) {
  if (!str) return "";
  str = str.toLowerCase();
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Khử dấu
  str = str.replace(/[đĐ]/g, "d");
  str = str.replace(/[^a-z0-9 ]/g, ""); // Bỏ ký tự đặc biệt
  str = str.trim().replace(/\s+/g, "-"); // Khoảng trắng thành gạch ngang
  return str;
}

function generateTimestampId() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
}

// =============================================================================
// MODALS
// =============================================================================
class NewNoteModal extends Modal {
  constructor(app, titleLabel, onSubmit) {
    super(app);
    this.titleLabel = titleLabel;
    this.onSubmit = onSubmit;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl('h2', { text: this.titleLabel });
    const inputEl = contentEl.createEl('input', { type: 'text' });
    inputEl.style.width = '100%';
    inputEl.focus();
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.onSubmit(inputEl.value);
        this.close();
      }
    });
  }
}

// =============================================================================
// PLUGIN CHÍNH
// =============================================================================
class DailyNavPlugin extends Plugin {
  async onload() {
    this.settings = Object.assign({ cursorPositions: {} }, await this.loadData());

    // 1. Lưu/Khôi phục con trỏ
    this.registerEvent(this.app.workspace.on('layout-change', () => this.saveCurrentCursor()));
    this.registerEvent(this.app.workspace.on('file-open', (file) => { if (file) this.restoreCursor(file.path); }));

    // 2. LẮNG NGHE TẠO FILE TOÀN HỆ THỐNG (Quan trọng nhất)
    this.registerEvent(this.app.vault.on('create', async (file) => {
      if (!(file instanceof TFile) || file.extension !== 'md') return;
      
      // Đợi một chút để đảm bảo file được ghi xuống đĩa
      setTimeout(async () => {
        const content = await this.app.vault.read(file);
        if (content.trim() === "") {
          await this.applyAutoTemplate(file);
        }
      }, 200);
    }));

    // 7. TỰ ĐỘNG CẬP NHẬT NỘI DUNG KHI ĐỔI TÊN FILE (Sửa lỗi Untitled)
    this.registerEvent(
      this.app.vault.on('rename', async (file, oldPath) => {
        if (!(file instanceof TFile) || file.extension !== 'md') return;

        // Lấy tên file cũ từ đường dẫn cũ
        const oldName = oldPath.split('/').pop().replace('.md', '');
        const newName = file.basename;

        // Chỉ xử lý nếu tên cũ là "Untitled" (hoặc chứa Untitled) và tên mới đã được đổi
        if (oldName.toLowerCase().includes("untitled") && !newName.toLowerCase().includes("untitled")) {
          let content = await this.app.vault.read(file);
          
          // 1. Cập nhật ID: thay phần "-untitled" bằng "-tên-mới-slug"
          const newSlug = toSlug(newName);
          content = content.replace(new RegExp(`id: (\\d+)-${toSlug(oldName)}`, 'g'), `id: $1-${newSlug}`);
          
          // 2. Cập nhật Aliases
          content = content.replace(new RegExp(`  - ${oldName}`, 'g'), `  - ${newName}`);
          
          // 3. Cập nhật Tiêu đề H1 (# Untitled -> # Tên Mới)
          content = content.replace(new RegExp(`# ${oldName}`, 'g'), `# ${newName}`);

          await this.app.vault.modify(file, content);
          new Notice(`✅ Đã đồng bộ nội dung theo tên mới: ${newName}`);
        }
      })
    );

    // 3. Command: Tạo Link Wiki (Giống Neovim leader ni)
    this.addCommand({
      id: 'insert-wiki-link-with-id',
      name: 'Insert Wiki Link with ID',
      editorCallback: (editor) => {
        new NewNoteModal(this.app, 'Nhập tiêu đề cho Link mới', (title) => {
          if (!title) return;
          const ts = generateTimestampId();
          const slug = toSlug(title);
          const wikiLink = `[[${ts}-${slug}|${title}]]`;
          // Sử dụng CONFIG.inboxFolder để chỉ định thư mục lưu trữ
          // const wikiLink = `[[${CONFIG.inboxFolder}/${ts}-${slug}|${title}]]`;
          editor.replaceRange(wikiLink, editor.getCursor());
          const newPos = editor.getCursor();
          editor.setCursor({ line: newPos.line, ch: newPos.ch + wikiLink.length });
        }).open();
      },
    });

    // 4. Command: Tạo Inbox Note (Giống Neovim leader jn)
    this.addCommand({
      id: 'create-inbox-note',
      name: 'Create New Inbox Note',
      callback: () => {
        new NewNoteModal(this.app, 'Tên ghi chú mới (Inbox)', (title) => this.createNewInboxNote(title)).open();
      },
    });

    // 5. Command: Mở Daily Note
    this.addCommand({
      id: 'open-daily',
      name: 'Open Daily Note Today',
      callback: () => this.openOrCreateDailyNote(new Date()),
    });

    // 6. Giao diện Ribbon
    this.addRibbonIcon('calendar', 'Daily Note Today', () => this.openOrCreateDailyNote(new Date()));
    this.addRibbonIcon('link', 'Insert ID Link', () => {
      const view = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (view) this.app.commands.executeCommandById('daily-nav:insert-wiki-link-with-id');
    });

    // Tự động tạo Daily khi mở App
    this.app.workspace.onLayoutReady(async () => { await this.autoCreateToday(); });
  }

  // --- LOGIC TỰ ĐỘNG CHÈN TEMPLATE ---
  async applyAutoTemplate(file) {
    const title = file.basename;
    let content = "";

    if (file.path.startsWith(CONFIG.journalFolder)) {
      // TEMPLATE DAILY
      const info = this.formatDate(new Date()); // Giả định ngày tạo là hôm nay
      content = [
        '---',
        `id: ${generateTimestampId()}-${title}`,
        'aliases: [' + title + ']',
        'tags: [daily]',
        `date: ${new Date().toISOString().split('T')[0]}`,
        '---',
        '',
        `# ${title}`,
        '',
        '## 📝 Notes',
        '- ',
      ].join('\n');
    } else {
      // TEMPLATE INBOX / OTHER (AI METADATA)
      // Tách ID nếu tên file có dạng "2026...-slug"
      let displayTitle = title;
      let id = generateTimestampId() + "-" + toSlug(title);
      const match = title.match(/^(\d+)-(.*)/);
      if (match) {
        id = title;
        displayTitle = match[2].replace(/-/g, " ");
      }

      content = [
        '---',
        `id: ${id}`,
        'aliases:',
        `  - ${displayTitle}`,
        `date: ${new Date().toISOString().split('T')[0]}`,
        'type: inbox-note',
        'summary: ""',
        'keywords: []',
        'status: "raw"',
        '---',
        '',
        `# ${displayTitle}`,
        '',
        '## 🤖 AI Summary',
        '> ',
        '',
        '## 📝 Notes',
        '- ',
      ].join('\n');
    }

    await this.app.vault.modify(file, content);
    this.jumpToNotes();
  }

  async createNewInboxNote(title) {
    if (!title) return;
    if (!this.app.vault.getAbstractFileByPath(CONFIG.inboxFolder)) {
      await this.app.vault.createFolder(CONFIG.inboxFolder);
    }
    const fileName = `${generateTimestampId()}-${toSlug(title)}.md`;
    const newFile = await this.app.vault.create(`${CONFIG.inboxFolder}/${fileName}`, "");
    await this.app.workspace.getLeaf(false).openFile(newFile);
  }

  async openOrCreateDailyNote(date) {
    const info = this.formatDate(date);
    const existing = this.app.vault.getAbstractFileByPath(info.relPath);
    if (existing instanceof TFile) {
      await this.app.workspace.getLeaf(false).openFile(existing);
    } else {
      const dirPath = info.relPath.substring(0, info.relPath.lastIndexOf('/'));
      if (!this.app.vault.getAbstractFileByPath(dirPath)) {
        await this.app.vault.createFolder(dirPath);
      }
      const newFile = await this.app.vault.create(info.relPath, "");
      await this.app.workspace.getLeaf(false).openFile(newFile);
    }
  }

  // --- CÁC HÀM CƠ BẢN ---
  formatDate(date) {
    const pad = (n) => String(n).padStart(2, '0');
    const year = date.getFullYear(), month = pad(date.getMonth() + 1), day = pad(date.getDate());
    const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return { relPath: `${CONFIG.journalFolder}/${year}/${month}/${year}-${month}-${day}-${weekdays[date.getDay()]}.md` };
  }

  async autoCreateToday() {
    const info = this.formatDate(new Date());
    if (!this.app.vault.getAbstractFileByPath(info.relPath)) {
      await this.openOrCreateDailyNote(new Date());
    }
  }

  async saveCurrentCursor() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (view?.file) {
      this.settings.cursorPositions[view.file.path] = view.editor.getCursor();
      await this.saveData(this.settings);
    }
  }

  async restoreCursor(path) {
    const pos = this.settings.cursorPositions[path];
    if (pos) {
      setTimeout(() => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (view?.file.path === path) {
          view.editor.setCursor(pos);
          view.editor.scrollIntoView({from: pos, to: pos}, true);
        }
      }, 150);
    }
  }

  jumpToNotes() {
    setTimeout(() => {
      const view = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (view) {
        const editor = view.editor;
        for (let i = 0; i < editor.lineCount(); i++) {
          if (editor.getLine(i).includes('## 📝 Notes')) {
            editor.setCursor({ line: i + 1, ch: 2 });
            editor.focus();
            break;
          }
        }
      }
    }, 400);
  }
}

module.exports = DailyNavPlugin;

