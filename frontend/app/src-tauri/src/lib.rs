//! AutoAgent, UI-only build: two windows (the island and the settings window) and a few window
//! commands. There is no hook server, agent connection, account or network code yet.

mod island;

use tauri::{AppHandle, Manager, WindowEvent};

/// Shows the settings window and brings it to the front.
#[tauri::command]
fn open_main(app: AppHandle) {
    if let Some(win) = app.get_webview_window("main") {
        let _ = win.unminimize();
        let _ = win.show();
        let _ = win.set_focus();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            island::island_resize,
            island::island_set_focusable,
            open_main
        ])
        .setup(|app| {
            // The island starts hidden so it never shows in the wrong place: place it, then show it.
            let handle = app.handle();
            island::place(handle, island::COMPACT_W, island::COMPACT_H);
            if let Some(win) = island::window(handle) {
                let _ = win.show();
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            // UI-only build: there is no tray yet, so closing the settings window quits the app.
            if window.label() == "main" {
                if let WindowEvent::CloseRequested { .. } = event {
                    window.app_handle().exit(0);
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running AutoAgent");
}
