import React, { useState } from 'react'
import { Button, Badge, Input } from '@/components/shared/ui'
import { webhookUtils, WEBHOOK_EVENTS_OPTIONS, WEBHOOK_CATEGORIES_OPTIONS } from '@/utils/constants/webhookEvents'
import { Search, Check, Plus, X, Filter } from 'lucide-react'

/**
 * Seletor de eventos para webhooks - Atualizado para usar o arquivo completo
 */
export const EventSelector = ({ 
  selectedEvents = [], 
  onChange, 
  error,
  maxEvents = 10 
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAll, setShowAll] = useState(false)

  // Filtra eventos pela busca e categoria
  const filteredEvents = WEBHOOK_EVENTS_OPTIONS.filter(event => {
    const matchesSearch = !searchTerm || 
      event.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.value.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || 
      event.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Agrupa eventos por categoria
  const eventsByCategory = webhookUtils.groupEventsByCategory()
  const filteredCategories = selectedCategory === 'all' 
    ? eventsByCategory
    : { [selectedCategory]: eventsByCategory[selectedCategory] || [] }

  // Eventos para exibir (limitados se não showAll)
  const eventsToShow = showAll ? filteredEvents : filteredEvents.slice(0, 12)

  // Handlers
  const handleEventToggle = (event) => {
    const newEvents = selectedEvents.includes(event)
      ? selectedEvents.filter(e => e !== event)
      : [...selectedEvents, event]
    
    onChange(newEvents)
  }

  const handleSelectAll = () => {
    const allVisibleEvents = filteredEvents.map(e => e.value)
    onChange(allVisibleEvents.slice(0, maxEvents))
  }

  const handleClearAll = () => {
    onChange([])
  }

  const handleCategorySelect = (categoryEvents) => {
    const newEvents = [...new Set([...selectedEvents, ...categoryEvents])]
    onChange(newEvents.slice(0, maxEvents))
  }

  const selectedCount = selectedEvents.length
  const hasMore = filteredEvents.length > eventsToShow.length

  return (
    <div className="space-y-4">
      {/* Header com busca e filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            size="sm"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todas as categorias</option>
            {WEBHOOK_CATEGORIES_OPTIONS.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={selectedCount >= maxEvents}
          >
            <Plus className="h-4 w-4 mr-1" />
            Todos
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={selectedCount === 0}
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        </div>
      </div>

      {/* Contador e eventos selecionados */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-sm">
            {selectedCount} de {maxEvents} eventos selecionados
          </Badge>
          
          {selectedCount >= maxEvents && (
            <span className="text-xs text-amber-600">
              Limite máximo atingido
            </span>
          )}
        </div>
        
        {selectedCount > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedEvents.slice(0, 5).map(event => {
              const eventConfig = webhookUtils.getEventConfig(event)
              return (
                <Badge 
                  key={event} 
                  variant="secondary" 
                  size="sm"
                  className="text-xs"
                >
                  {eventConfig?.label || event}
                </Badge>
              )
            })}
            {selectedCount > 5 && (
              <Badge variant="secondary" size="sm" className="text-xs">
                +{selectedCount - 5} mais
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Seleção rápida por categoria */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">
          Seleção rápida por categoria:
        </h4>
        
        <div className="flex flex-wrap gap-2">
          {WEBHOOK_CATEGORIES_OPTIONS.map(category => (
            <Button
              key={category.value}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleCategorySelect(category.events.map(e => e.value))}
              className="text-xs"
            >
              <Filter className="h-3 w-3 mr-1" />
              {category.label} ({category.events.length})
            </Button>
          ))}
        </div>
      </div>

      {/* Lista de eventos */}
      <div className="space-y-4 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-4">
        {Object.entries(filteredCategories).map(([categoryKey, categoryEvents]) => (
          <div key={categoryKey} className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 text-sm capitalize">
                {categoryKey.replace('_', ' ')}
              </h4>
              <Badge variant="outline" size="sm">
                {categoryEvents.filter(e => 
                  filteredEvents.find(fe => fe.value === e.event)
                ).length}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {categoryEvents
                .filter(event => filteredEvents.find(fe => fe.value === event.event))
                .slice(0, showAll ? undefined : 4)
                .map(event => (
                  <label
                    key={event.event}
                    className={`
                      flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200
                      ${selectedEvents.includes(event.event)
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                      ${selectedCount >= maxEvents && !selectedEvents.includes(event.event)
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                      }
                    `}
                  >
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(event.event)}
                        onChange={() => handleEventToggle(event.event)}
                        disabled={selectedCount >= maxEvents && !selectedEvents.includes(event.event)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: event.color }}
                        />
                        <p className="font-medium text-gray-900 text-sm">
                          {event.label}
                        </p>
                        {selectedEvents.includes(event.event) && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-500 mb-2">
                        {event.description}
                      </p>
                      
                      <code className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        {event.event}
                      </code>
                    </div>
                  </label>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Botão para mostrar mais */}
      {hasMore && (
        <div className="text-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAll(true)}
          >
            Ver todos os eventos ({filteredEvents.length})
          </Button>
        </div>
      )}

      {/* Erro */}
      {error && (
        <p className="text-sm text-red-600 mt-2 p-2 bg-red-50 border border-red-200 rounded">
          {error}
        </p>
      )}

      {/* Estado vazio */}
      {filteredEvents.length === 0 && searchTerm && (
        <div className="text-center py-8 text-gray-500">
          <Search className="mx-auto h-8 w-8 mb-2" />
          <p>Nenhum evento encontrado para "{searchTerm}"</p>
        </div>
      )}
    </div>
  )
}