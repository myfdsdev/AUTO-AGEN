//! The island window: sized to its content by the page, always at the top centre of the screen.
//! It is not focusable by default, so clicking it never takes focus from the app the user is in;
//! the page makes it focusable only while the pointer is on an open island (for its text field and keys).

use tauri::{AppHandle, Manager, PhysicalPosition, PhysicalSize, WebviewWindow};

pub const LABEL: &str = "island";

/// The compact bar's size in logical pixels (Island board), used before the page reports its own.
pub const COMPACT_W: f64 = 340.0;
pub const COMPACT_H: f64 = 44.0;

/// Upper bounds for what the page may ask for, in logical pixels.
const MAX_W: f64 = 1200.0;
const MAX_H: f64 = 900.0;

pub fn window(app: &AppHandle) -> Option<WebviewWindow> {
    app.get_webview_window(LABEL)
}

/// A size from the page, kept finite and within bounds.
fn clamp(v: f64, max: f64) -> f64 {
    if v.is_finite() {
        v.clamp(1.0, max)
    } else {
        max
    }
}

/// Sizes the island (logical pixels) and puts it at the top centre of the primary monitor.
pub fn place(app: &AppHandle, width: f64, height: f64) {
    let Some(win) = window(app) else { return };
    let monitor = win
        .primary_monitor()
        .ok()
        .flatten()
        .or_else(|| win.current_monitor().ok().flatten());
    let Some(m) = monitor else { return };

    let scale = m.scale_factor();
    let pw = (clamp(width, MAX_W) * scale).round().max(1.0) as u32;
    let ph = (clamp(height, MAX_H) * scale).round().max(1.0) as u32;
    let x = m.position().x + (m.size().width as i32 - pw as i32) / 2;
    let y = m.position().y;

    let _ = win.set_size(PhysicalSize::new(pw, ph));
    let _ = win.set_position(PhysicalPosition::new(x, y));
    let _ = win.set_always_on_top(true);
}

/// The page reports the island's size whenever it changes.
#[tauri::command]
pub fn island_resize(app: AppHandle, width: f64, height: f64) {
    place(&app, width, height);
}

/// Lets the island take keyboard focus, or gives focus back to whatever the user was in.
#[tauri::command]
pub fn island_set_focusable(app: AppHandle, focusable: bool) {
    if let Some(win) = window(&app) {
        let _ = win.set_focusable(focusable);
    }
}

#[cfg(test)]
mod tests {
    use super::clamp;

    #[test]
    fn sizes_from_the_page_stay_in_bounds() {
        assert_eq!(clamp(680.0, 1200.0), 680.0);
        assert_eq!(clamp(0.0, 1200.0), 1.0);
        assert_eq!(clamp(5000.0, 1200.0), 1200.0);
        assert_eq!(clamp(f64::NAN, 900.0), 900.0);
    }
}
