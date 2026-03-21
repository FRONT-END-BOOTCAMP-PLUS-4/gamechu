$data = $null
if ([Console]::IsInputRedirected) {
    $raw = [Console]::In.ReadToEnd()
    if ($raw) { $data = $raw | ConvertFrom-Json }
}

$project = if ($data -and $data.cwd) { Split-Path $data.cwd -Leaf } else { "Unknown project" }
$stopped = $data -and $data.stop_hook_active -eq $true

[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType=WindowsRuntime] | Out-Null
$template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent(
    [Windows.UI.Notifications.ToastTemplateType]::ToastText02
)
$nodes = $template.GetElementsByTagName('text')
$nodes.Item(0).AppendChild($template.CreateTextNode("Claude Code [$project]")) | Out-Null
$status = if ($stopped) { "Job stopped" } else { "Job complete" }
$nodes.Item(1).AppendChild($template.CreateTextNode($status)) | Out-Null
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('Claude Code').Show(
    [Windows.UI.Notifications.ToastNotification]::new($template)
)
