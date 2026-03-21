/// Kaijudo Desktop — Tauri v2 shell.
///
/// Keep this thin. Game logic belongs in the frontend or shared packages.
/// Only add Rust commands here when you need native capabilities
/// (filesystem, OS integration, system tray, etc.).

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
