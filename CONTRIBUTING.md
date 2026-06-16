# 给 VGraph 做贡献

首先，非常感谢您对 VGraph 项目的贡献。我们欢迎任何形式的贡献，包括但不限于：

-   提交问题和建议
-   改进文档
-   提交拉取请求 (PR)

## 提交问题

我们使用 [GitHub Issues](https://github.com/visactor/vgraph/issues) 进行问题跟踪。在提交问题之前，请确保还没有人提交过类似的问题。

提交问题时，请提供详细的描述，包括您的操作系统、浏览器版本和可复现的演示。这将有助于我们快速定位和解决问题。

## 运行 Demo

您可以运行 demo 来了解更多关于 VGraph 的信息。

```bash
# 安装依赖
rush update

# 启动 demo
rush start
```

## 提交拉取请求

如果您想提交拉取请求，请遵循以下步骤：

1.  将 VGraph 存储库 Fork 到您自己的帐户。
2.  将 Fork 后的存储库克隆到本地。
3.  运行 `rush update` 安装依赖项。
4.  创建一个新分支并进行更改。我们建议将分支命名为 `feat/your-feature-name` 或 `fix/your-fix-name`。
5.  运行 `rush change-all` 添加变更集。
6.  提交并将更改推送到您 Fork 的存储库。
7.  从您 Fork 的存储库创建一个到 VGraph 存储库 `develop` 分支的拉取请求。

我们会尽快审查您的拉取请求。感谢您的贡献！

## 变更集和 Release

VGraph 使用 Rush changefile 记录版本变更和 release note 输入。每次提交可发布改动时，请在提交前生成一个 changefile。

```bash
# patch / minor / major 三选一
rush change-all --type patch --message "fix: describe your change"
```

生成后的 `*.json` 文件会放在 `common/changes/@visactor/vgraph/` 下，并在 release workflow 中被自动读取。

- `type` 目前固定使用 `patch`、`minor`、`major`
- `comment` 会直接进入 changelog 生成链路，建议写成可发布的完整句子
- 不要在该目录保留占位模板文件，release 会消费所有 `*.json`

如需查看当前仓库使用的示例，可参考 `common/changes/@visactor/vgraph/2026-06-16-release-workflow-bootstrap.json`。
