$data = $null
if ([Console]::IsInputRedirected) {
    $raw = [Console]::In.ReadToEnd()
    if ($raw) { $data = $raw | ConvertFrom-Json }
}

$project = if ($data -and $data.cwd) { Split-Path $data.cwd -Leaf } else { "Unknown project" }
$message = if ($data -and $data.message) { $data.message } else { "Action required" }

[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType=WindowsRuntime] | Out-Null
$template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent(
    [Windows.UI.Notifications.ToastTemplateType]::ToastText02
)
$nodes = $template.GetElementsByTagName('text')
$nodes[0].AppendChild($template.CreateTextNode("Claude Code - Needs Attention [$project]")) | Out-Null
$nodes[1].AppendChild($template.CreateTextNode($message)) | Out-Null
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('Claude Code').Show(
    [Windows.UI.Notifications.ToastNotification]::new($template)
)
