## ADDED Requirements

### Requirement: Usage management entry SHALL be located in settings page
系统 SHALL 在设置页面提供“用量管理”入口，并将其作为进入管理授权页面的唯一入口位置。

#### Scenario: Settings page shows usage management entry
- **WHEN** 用户进入设置页面
- **THEN** 系统 SHALL 显示名称为“用量管理”的入口项

#### Scenario: Sidebar does not show usage management entry
- **WHEN** 用户查看侧边栏导航区域
- **THEN** 系统 SHALL 不再显示“后台管理”或“用量管理”入口按钮

### Requirement: Usage management entry SHALL navigate to existing admin panel
系统 SHALL 在用户点击设置页“用量管理”入口后，进入现有管理面板视图，并保持原有管理员密码闸口和授权表单流程。

#### Scenario: Navigate from settings to admin panel
- **WHEN** 用户在设置页面点击“用量管理”入口
- **THEN** 系统 SHALL 切换到管理面板页面

#### Scenario: Existing admin gate and grant flow remain unchanged
- **WHEN** 用户通过设置页面进入管理面板后进行操作
- **THEN** 系统 SHALL 继续执行现有管理员密码校验与授权提交流程
