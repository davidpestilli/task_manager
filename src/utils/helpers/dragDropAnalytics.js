/**
 * Sistema de analytics para operações de drag & drop
 * Coleta métricas de uso e performance para otimização da UX
 */

class DragDropAnalytics {
  constructor() {
    this.sessions = []
    this.currentSession = null
    this.metrics = {
      totalDrags: 0,
      successfulDrops: 0,
      cancelledDrags: 0,
      averageDragTime: 0,
      mostUsedSources: new Map(),
      mostUsedTargets: new Map(),
      errorReasons: new Map(),
      timeToComplete: []
    }
  }

  /**
   * Inicia uma nova sessão de drag
   */
  startDragSession(data) {
    this.currentSession = {
      id: generateSessionId(),
      startTime: Date.now(),
      task: data.task,
      sourcePersonId: data.sourcePersonId,
      dragPath: [],
      validationAttempts: [],
      endTime: null,
      outcome: null,
      error: null
    }

    this.metrics.totalDrags++
    this.updateSourceUsage(data.sourcePersonId)

    // Log para debug
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 Drag iniciado:', {
        sessionId: this.currentSession.id,
        task: data.task.name,
        source: data.sourcePersonId
      })
    }
  }

  /**
   * Registra uma tentativa de validação durante o drag
   */
  recordValidationAttempt(targetPersonId, validationResult) {
    if (!this.currentSession) return

    const attempt = {
      timestamp: Date.now(),
      targetPersonId,
      isValid: validationResult.isValid,
      reason: validationResult.reason,
      timeFromStart: Date.now() - this.currentSession.startTime
    }

    this.currentSession.validationAttempts.push(attempt)
    this.currentSession.dragPath.push(targetPersonId)

    // Registrar razões de erro
    if (!validationResult.isValid && validationResult.reason) {
      this.updateErrorReasons(validationResult.reason)
    }
  }

  /**
   * Finaliza sessão com sucesso
   */
  endDragSuccess(targetPersonId, operationType = 'transfer') {
    if (!this.currentSession) return

    const endTime = Date.now()
    const duration = endTime - this.currentSession.startTime

    this.currentSession.endTime = endTime
    this.currentSession.outcome = 'success'
    this.currentSession.targetPersonId = targetPersonId
    this.currentSession.operationType = operationType

    // Atualizar métricas
    this.metrics.successfulDrops++
    this.updateTargetUsage(targetPersonId)
    this.updateAverageDragTime(duration)
    this.metrics.timeToComplete.push(duration)

    // Salvar sessão
    this.sessions.push({ ...this.currentSession })
    this.currentSession = null

    // Log para debug
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Drag concluído com sucesso:', {
        duration: `${duration}ms`,
        target: targetPersonId,
        type: operationType
      })
    }
  }

  /**
   * Finaliza sessão com cancelamento
   */
  endDragCancel(reason = 'user_cancel') {
    if (!this.currentSession) return

    const endTime = Date.now()
    const duration = endTime - this.currentSession.startTime

    this.currentSession.endTime = endTime
    this.currentSession.outcome = 'cancelled'
    this.currentSession.error = reason

    // Atualizar métricas
    this.metrics.cancelledDrags++
    this.updateAverageDragTime(duration)

    // Salvar sessão
    this.sessions.push({ ...this.currentSession })
    this.currentSession = null

    // Log para debug
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ Drag cancelado:', {
        duration: `${duration}ms`,
        reason
      })
    }
  }

  /**
   * Obter relatório de performance
   */
  getPerformanceReport() {
    const totalSessions = this.sessions.length
    if (totalSessions === 0) return null

    const successRate = (this.metrics.successfulDrops / this.metrics.totalDrags) * 100
    const avgTimeToComplete = this.metrics.timeToComplete.length > 0 
      ? this.metrics.timeToComplete.reduce((a, b) => a + b, 0) / this.metrics.timeToComplete.length
      : 0

    return {
      overview: {
        totalDrags: this.metrics.totalDrags,
        successfulDrops: this.metrics.successfulDrops,
        cancelledDrags: this.metrics.cancelledDrags,
        successRate: Math.round(successRate * 100) / 100,
        averageDragTime: Math.round(this.metrics.averageDragTime),
        averageTimeToComplete: Math.round(avgTimeToComplete)
      },
      usage: {
        mostUsedSources: Array.from(this.metrics.mostUsedSources.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5),
        mostUsedTargets: Array.from(this.metrics.mostUsedTargets.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
      },
      errors: {
        commonReasons: Array.from(this.metrics.errorReasons.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
      },
      timeAnalysis: this.analyzeTimePatterns()
    }
  }

  /**
   * Obter padrões de uso por pessoa
   */
  getPersonUsagePatterns() {
    const patterns = {}

    this.sessions.forEach(session => {
      const { sourcePersonId, targetPersonId, outcome, operationType } = session

      // Padrões de origem
      if (!patterns[sourcePersonId]) {
        patterns[sourcePersonId] = {
          asSource: { total: 0, successful: 0, cancelled: 0 },
          asTarget: { total: 0, successful: 0, cancelled: 0 },
          operations: { transfer: 0, share: 0 }
        }
      }

      patterns[sourcePersonId].asSource.total++
      if (outcome === 'success') {
        patterns[sourcePersonId].asSource.successful++
        patterns[sourcePersonId].operations[operationType] = 
          (patterns[sourcePersonId].operations[operationType] || 0) + 1
      } else {
        patterns[sourcePersonId].asSource.cancelled++
      }

      // Padrões de destino
      if (targetPersonId && outcome === 'success') {
        if (!patterns[targetPersonId]) {
          patterns[targetPersonId] = {
            asSource: { total: 0, successful: 0, cancelled: 0 },
            asTarget: { total: 0, successful: 0, cancelled: 0 },
            operations: { transfer: 0, share: 0 }
          }
        }

        patterns[targetPersonId].asTarget.total++
        patterns[targetPersonId].asTarget.successful++
      }
    })

    return patterns
  }

  /**
   * Identificar pontos de fricção na UX
   */
  identifyUXFrictions() {
    const frictions = []

    // Taxa de cancelamento alta
    const cancelRate = (this.metrics.cancelledDrags / this.metrics.totalDrags) * 100
    if (cancelRate > 30) {
      frictions.push({
        type: 'high_cancel_rate',
        severity: 'high',
        description: `Taxa de cancelamento alta: ${Math.round(cancelRate)}%`,
        suggestion: 'Considere melhorar o feedback visual durante o drag'
      })
    }

    // Tempo médio muito alto
    if (this.metrics.averageDragTime > 5000) {
      frictions.push({
        type: 'slow_drag_time',
        severity: 'medium',
        description: `Tempo médio de drag alto: ${Math.round(this.metrics.averageDragTime)}ms`,
        suggestion: 'Otimize validações e feedback em tempo real'
      })
    }

    // Muitas tentativas de validação fracassadas
    const failedValidations = this.sessions.reduce((acc, session) => {
      return acc + session.validationAttempts.filter(v => !v.isValid).length
    }, 0)

    const avgFailedValidations = failedValidations / this.sessions.length
    if (avgFailedValidations > 2) {
      frictions.push({
        type: 'validation_confusion',
        severity: 'medium',
        description: `Média de ${Math.round(avgFailedValidations)} validações falhadas por drag`,
        suggestion: 'Melhore indicadores visuais de targets válidos/inválidos'
      })
    }

    // Erros frequentes por tipo
    const topError = Array.from(this.metrics.errorReasons.entries())
      .sort((a, b) => b[1] - a[1])[0]

    if (topError && topError[1] > this.metrics.totalDrags * 0.2) {
      frictions.push({
        type: 'frequent_error',
        severity: 'high',
        description: `Erro frequente: ${topError[0]} (${topError[1]} ocorrências)`,
        suggestion: this.getErrorSuggestion(topError[0])
      })
    }

    return frictions
  }

  /**
   * Gerar recomendações para otimização
   */
  generateOptimizationRecommendations() {
    const report = this.getPerformanceReport()
    const frictions = this.identifyUXFrictions()
    const recommendations = []

    // Baseado na taxa de sucesso
    if (report.overview.successRate < 80) {
      recommendations.push({
        category: 'success_rate',
        priority: 'high',
        title: 'Melhorar Taxa de Sucesso',
        description: 'A taxa de sucesso está abaixo do ideal (80%)',
        actions: [
          'Revisar validações de transfer',
          'Melhorar feedback visual',
          'Simplificar processo de confirmação'
        ]
      })
    }

    // Baseado em padrões de uso
    if (report.usage.mostUsedSources.length > 0) {
      const topSource = report.usage.mostUsedSources[0]
      recommendations.push({
        category: 'usage_optimization',
        priority: 'medium',
        title: 'Otimizar Pessoa Mais Ativa',
        description: `A pessoa ${topSource[0]} é a origem de ${topSource[1]} drags`,
        actions: [
          'Considerar redistribuição de carga',
          'Verificar se precisa de mais recursos',
          'Otimizar fluxo para essa pessoa'
        ]
      })
    }

    // Adicionar fricções identificadas
    frictions.forEach(friction => {
      recommendations.push({
        category: 'ux_friction',
        priority: friction.severity,
        title: friction.description,
        description: friction.suggestion,
        actions: [friction.suggestion]
      })
    })

    return recommendations
  }

  /**
   * Métodos auxiliares privados
   */
  updateSourceUsage(personId) {
    const current = this.metrics.mostUsedSources.get(personId) || 0
    this.metrics.mostUsedSources.set(personId, current + 1)
  }

  updateTargetUsage(personId) {
    const current = this.metrics.mostUsedTargets.get(personId) || 0
    this.metrics.mostUsedTargets.set(personId, current + 1)
  }

  updateErrorReasons(reason) {
    const current = this.metrics.errorReasons.get(reason) || 0
    this.metrics.errorReasons.set(reason, current + 1)
  }

  updateAverageDragTime(duration) {
    const total = this.metrics.averageDragTime * (this.metrics.totalDrags - 1)
    this.metrics.averageDragTime = (total + duration) / this.metrics.totalDrags
  }

  analyzeTimePatterns() {
    if (this.metrics.timeToComplete.length === 0) return {}

    const times = this.metrics.timeToComplete.sort((a, b) => a - b)
    const median = times[Math.floor(times.length / 2)]
    const min = Math.min(...times)
    const max = Math.max(...times)

    return { min, max, median, samples: times.length }
  }

  getErrorSuggestion(errorType) {
    const suggestions = {
      'overloaded': 'Implemente melhor visualização de capacidade das pessoas',
      'missing_permissions': 'Clarifique permissões na interface',
      'unresolved_dependencies': 'Melhore indicadores de dependências',
      'same_person': 'Previna drag para a mesma origem',
      'task_completed': 'Desabilite drag para tarefas concluídas'
    }

    return suggestions[errorType] || 'Revise a lógica de validação'
  }

  /**
   * Exportar dados para análise externa
   */
  exportData() {
    return {
      sessions: this.sessions,
      metrics: {
        ...this.metrics,
        mostUsedSources: Array.from(this.metrics.mostUsedSources.entries()),
        mostUsedTargets: Array.from(this.metrics.mostUsedTargets.entries()),
        errorReasons: Array.from(this.metrics.errorReasons.entries())
      },
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Limpar dados (útil para testes ou reset)
   */
  reset() {
    this.sessions = []
    this.currentSession = null
    this.metrics = {
      totalDrags: 0,
      successfulDrops: 0,
      cancelledDrags: 0,
      averageDragTime: 0,
      mostUsedSources: new Map(),
      mostUsedTargets: new Map(),
      errorReasons: new Map(),
      timeToComplete: []
    }
  }
}

/**
 * Gerar ID único para sessão
 */
function generateSessionId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Instância singleton para uso global
export const dragDropAnalytics = new DragDropAnalytics()

// Hook para usar analytics em componentes React
export const useDragDropAnalytics = () => {
  return {
    startSession: (data) => dragDropAnalytics.startDragSession(data),
    recordValidation: (target, result) => dragDropAnalytics.recordValidationAttempt(target, result),
    endSuccess: (target, type) => dragDropAnalytics.endDragSuccess(target, type),
    endCancel: (reason) => dragDropAnalytics.endDragCancel(reason),
    getReport: () => dragDropAnalytics.getPerformanceReport(),
    getRecommendations: () => dragDropAnalytics.generateOptimizationRecommendations(),
    exportData: () => dragDropAnalytics.exportData(),
    reset: () => dragDropAnalytics.reset()
  }
}