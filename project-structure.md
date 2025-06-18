task_manager/
├── node_modules/
├── .git/
├── supabase_tablecreations_and_policiescreations/
│   ├── create_task_manager_schema_with_enums (registro do sql que criou as tabelas no supabase)
│   └── task_manager_rls_full_access (registro do sql que liberou toda politica rls no supabase)
├── public/
│   ├── vite.svg
│   ├── manifest.json (PWA)
│   ├── sw.js (Service Worker)
│   └── index.html
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── ForgotPasswordForm.jsx
│   │   │   └── index.js
│   │   ├── dashboard/
│   │   │   ├── PersonalDashboard.jsx
│   │   │   ├── MetricCard.jsx
│   │   │   ├── ActivityTimeline.jsx
│   │   │   ├── ProgressChart.jsx
│   │   │   ├── ProjectProgressCards.jsx
│   │   │   └── index.js
│   │   ├── projects/
│   │   │   ├── ProjectCard.jsx
│   │   │   ├── ProjectList.jsx
│   │   │   ├── CreateProjectModal.jsx
│   │   │   ├── ProjectHeader.jsx
│   │   │   ├── ProjectSettings.jsx
│   │   │   └── index.js
│   │   ├── tasks/
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskList.jsx
│   │   │   ├── TaskModal.jsx
│   │   │   ├── CreateTaskModal.jsx
│   │   │   ├── DraggableTaskCard.jsx
│   │   │   ├── TaskSteps.jsx
│   │   │   ├── TaskComments.jsx
│   │   │   ├── TaskHistory.jsx
│   │   │   ├── DependencyFlow.jsx
│   │   │   ├── DependencySelector.jsx
│   │   │   ├── FlowChart.jsx
│   │   │   ├── DragDropArea.jsx
│   │   │   ├── DragPreview.jsx
│   │   │   ├── DropZone.jsx
│   │   │   ├── TaskFilters.jsx
│   │   │   ├── TaskStatusBadge.jsx
│   │   │   └── index.js
│   │   ├── people/
│   │   │   ├── PersonCard.jsx
│   │   │   ├── PersonList.jsx
│   │   │   ├── AddPersonModal.jsx
│   │   │   ├── PersonTasks.jsx
│   │   │   ├── PersonFilters.jsx
│   │   │   └── index.js
│   │   ├── shared/
│   │   │   ├── layout/
│   │   │   │   ├── Layout.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── ErrorBoundary.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── index.js
│   │   │   ├── navigation/
│   │   │   │   ├── Breadcrumb.jsx
│   │   │   │   ├── NavTabs.jsx
│   │   │   │   ├── BackButton.jsx
│   │   │   │   └── index.js
│   │   │   ├── search/
│   │   │   │   ├── SearchGlobal.jsx
│   │   │   │   ├── SearchResults.jsx
│   │   │   │   ├── SearchModal.jsx
│   │   │   │   ├── ResultCard.jsx
│   │   │   │   └── index.js
│   │   │   ├── notifications/
│   │   │   │   ├── NotificationCenter.jsx
│   │   │   │   ├── NotificationDropdown.jsx
│   │   │   │   ├── NotificationItem.jsx
│   │   │   │   ├── NotificationBadge.jsx
│   │   │   │   └── index.js
│   │   │   ├── export/
│   │   │   │   ├── ExportButtons.jsx
│   │   │   │   ├── PDFExport.jsx
│   │   │   │   ├── PExportModal.jsx
│   │   │   │   ├── CSVExport.jsx
│   │   │   │   └── index.js
│   │   │   ├── ui/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Spinner.jsx
│   │   │   │   ├── Toast.jsx
│   │   │   │   ├── Dropdown.jsx
│   │   │   │   ├── Tooltip.jsx
│   │   │   │   ├── ProgressBar.jsx
│   │   │   │   ├── Avatar.jsx
│   │   │   │   ├── Skeleton.jsx
│   │   │   │   ├── FlowNode.jsx
│   │   │   │   ├── FlowEdge.jsx
│   │   │   │   ├── StatCard.jsx
│   │   │   │   ├── Chart.jsx
│   │   │   │   ├── FullPageSpinner.jsx
│   │   │   │   └── index.js
│   │   │   ├── forms/
│   │   │   │   ├── FormField.jsx
│   │   │   │   ├── FormSelect.jsx
│   │   │   │   ├── FormTextarea.jsx
│   │   │   │   ├── FormCheckbox.jsx
│   │   │   │   ├── FormRadio.jsx
│   │   │   │   └── index.js
│   │   │   └── index.js
│   │   ├── webhooks/
│   │   │   ├── WebhookConfig.jsx
│   │   │   ├── WebhookCard.jsx
│   │   │   ├── WebhookModal.jsx
│   │   │   ├── WebhookList.jsx
│   │   │   ├── EventSelector.jsx
│   │   │   └── index.js
│   │   └── comments/
│   │       ├── CommentsList.jsx
│   │       ├── CommentItem.jsx
│   │       ├── CommentForm.jsx
│   │       ├── CommentThread.jsx
│   │       └── index.js
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   └── index.js
│   │   ├── dashboard/
│   │   │   ├── DashboardPage.jsx
│   │   │   └── index.js
│   │   ├── projects/
│   │   │   ├── ProjectsPage.jsx
│   │   │   ├── ProjectDetailPage.jsx
│   │   │   └── index.js
│   │   ├── tasks/
│   │   │   ├── TasksPage.jsx
│   │   │   ├── TaskDetailPage.jsx
│   │   │   └── index.js
│   │   ├── people/
│   │   │   ├── PeoplePage.jsx
│   │   │   ├── PersonDetailPage.jsx
│   │   │   └── index.js
│   │   ├── settings/
│   │   │   ├── SettingsPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── WebhooksPage.jsx
│   │   │   └── index.js
│   │   ├── notifications/
│   │   │   ├── NotificationsPage.jsx
│   │   │   └── index.js
│   │   └── NotFoundPage.jsx
│   ├── hooks/
│   │   ├── auth/
│   │   │   ├── useAuth.js
│   │   │   ├── useLogin.js
│   │   │   ├── useRegister.js
│   │   │   └── index.js
│   │   ├── projects/
│   │   │   ├── useProjects.js
│   │   │   ├── useProject.js
│   │   │   ├── useProjectMembers.js
│   │   │   └── index.js
│   │   ├── tasks/
│   │   │   ├── useTasks.js
│   │   │   ├── useTask.js
│   │   │   ├── useTaskSteps.js
│   │   │   ├── useTaskDependencies.js
│   │   │   ├── useTaskComments.js
│   │   │   └── index.js
│   │   ├── people/
│   │   │   ├── usePeople.js
│   │   │   ├── usePerson.js
│   │   │   └── index.js
│   │   ├── notifications/
│   │   │   ├── useNotifications.js
│   │   │   ├── useRealtime.js
│   │   │   └── index.js
│   │   ├── webhooks/
│   │   │   ├── useWebhooks.js
│   │   │   ├── useWebhook.js
│   │   │   └── index.js
│   │   ├── shared/
│   │   │   ├── useSearch.js
│   │   │   ├── useDragDrop.js
│   │   │   ├── useExport.js
│   │   │   ├── useLocalStorage.js
│   │   │   ├── useDebounce.js
│   │   │   ├── useModal.js
│   │   │   ├── useToast.js
│   │   │   └── index.js
│   │   └── dashboard/
│   │       ├── useMetrics.js
│   │       ├── useActivityLog.js
│   │       └── index.js
│   ├── services/
│   │   ├── api/
│   │   │   ├── supabase.js
│   │   │   ├── client.js
│   │   │   ├── searchService.js
│   │   │   └── index.js
│   │   ├── auth/
│   │   │   ├── authService.js
│   │   │   ├── sessionService.js
│   │   │   └── index.js
│   │   ├── projects/
│   │   │   ├── projectsService.js
│   │   │   ├── projectMembersService.js
│   │   │   └── index.js
│   │   ├── tasks/
│   │   │   ├── tasksService.js
│   │   │   ├── taskStepsService.js
│   │   │   ├── taskAssignmentsService.js
│   │   │   ├── taskDependenciesService.js
│   │   │   └── index.js
│   │   ├── people/
│   │   │   ├── peopleService.js
│   │   │   └── index.js
│   │   ├── notifications/
│   │   │   ├── notificationsService.js
│   │   │   ├── realtimeService.js
│   │   │   └── index.js
│   │   ├── webhooks/
│   │   │   ├── webhooksService.js
│   │   │   ├── webhookDispatcher.js
│   │   │   └── index.js
│   │   ├── export/
│   │   │   ├── pdfExportService.js
│   │   │   ├── csvExportService.js
│   │   │   └── index.js
│   │   ├── comments/
│   │   │   ├── commentsService.js
│   │   │   └── index.js
│   │   └── dashboard/
│   │       ├── metricsService.js
│   │       ├── activityService.js
│   │       └── index.js
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── ProjectContext.jsx
│   │   ├── TaskContext.jsx
│   │   ├── NotificationContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── index.js
│   ├── utils/
│   │   ├── constants/
│   │   │   ├── taskStatus.js
│   │   │   ├── userRoles.js
│   │   │   ├── webhookEvents.js
│   │   │   ├── notificationTypes.js
│   │   │   └── index.js
│   │   ├── helpers/
│   │   │   ├── dateFormatter.js
│   │   │   ├── flowUtils.js
│   │   │   ├── performanceUtils.js
│   │   │   ├── exportUtils.js
│   │   │   ├── validationUtils.js
│   │   │   ├── dragDropAnalytics.js
│   │   │   ├── dragDropUtils.js
│   │   │   ├── searchUtils.js
│   │   │   ├── highlightUtils.js
│   │   │   ├── chartUtils.js
│   │   │   ├── dependencyValidator.js
│   │   │   ├── stringUtils.js
│   │   │   ├── numberUtils.js
│   │   │   ├── colorUtils.js
│   │   │   ├── cn.js
│   │   │   └── index.js
│   │   ├── validations/
│   │   │   ├── authValidations.js
│   │   │   ├── projectValidations.js
│   │   │   ├── taskValidations.js
│   │   │   ├── webhookValidations.js
│   │   │   └── index.js
│   │   ├── formatters/
│   │   │   ├── dateFormatters.js
│   │   │   ├── numberFormatters.js
│   │   │   ├── textFormatters.js
│   │   │   └── index.js
│   │   └── permissions/
│   │       ├── projectPermissions.js
│   │       ├── taskPermissions.js
│   │       └── index.js
│   ├── styles/
│   │   ├── globals.css
│   │   ├── components.css
│   │   ├── utilities.css
│   │   ├── index.css
│   │   └── animations.css
│   ├── assets/
│   │   ├── images/
│   │   │   ├── logo.svg
│   │   │   ├── empty-state.svg
│   │   │   └── placeholder-avatar.svg
│   │   ├── icons/
│   │   │   └── index.js
│   │   └── fonts/
│   ├── config/
│   │   ├── supabase.js
│   │   ├── routes.js
│   │   ├── environment.js
│   │   └── constants.js
│   ├── types/
│   │   ├── auth.js
│   │   ├── project.js
│   │   ├── task.js
│   │   ├── user.js
│   │   ├── notification.js
│   │   ├── webhook.js
│   │   └── index.js
│   ├── App.jsx
│   ├── main.jsx
│   ├── app.css
│   └── index.css
├── .env
├── .env.local
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── README.md
├── CHANGELOG.md
├── eslint.config
├── index
├── package
├── lighthouserc.json
└── project-structure.md (este arquivo)



