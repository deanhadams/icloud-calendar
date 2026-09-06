import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export interface EndpointField {
  name: string
  type: string
  required: boolean
}

export interface EndpointDoc {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  path: string
  description: string
  requestBody?: EndpointField[]
  queryParams?: EndpointField[]
  responseNote?: string
  response: string
}

const METHOD_STYLES: Record<EndpointDoc['method'], string> = {
  GET: 'bg-signal-green-bg text-signal-green',
  POST: 'bg-cobalt-tint text-cobalt',
  PATCH: 'bg-signal-amber-bg text-signal-amber',
  DELETE: 'bg-red-100 text-red-700',
}

function FieldTable({ title, fields }: { title: string; fields: EndpointField[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-ink-muted">{title}</p>
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-ink-muted">
            <th className="pb-1 pr-4 font-medium">Field</th>
            <th className="pb-1 pr-4 font-medium">Type</th>
            <th className="pb-1 font-medium">Required</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field.name} className="border-t border-line">
              <td className="py-1.5 pr-4 font-mono text-ink">{field.name}</td>
              <td className="py-1.5 pr-4 font-mono text-ink-muted">{field.type}</td>
              <td className="py-1.5 text-ink-muted">{field.required ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function EndpointRow({ endpoint }: { endpoint: EndpointDoc }) {
  const [expanded, setExpanded] = useState(false)
  const { method, path, description, requestBody, queryParams, responseNote, response } = endpoint

  return (
    <div className="border-b border-line last:border-0">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center gap-3 px-6 py-4 text-left hover:bg-paper/60"
      >
        <span
          className={`inline-flex w-16 shrink-0 justify-center rounded-md px-2 py-1 font-mono text-xs font-semibold ${METHOD_STYLES[method]}`}
        >
          {method}
        </span>
        <code className="shrink-0 font-mono text-sm text-ink">{path}</code>
        <span className="flex-1 truncate text-sm text-ink-muted">{description}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-ink-muted transition-transform ${expanded ? '' : '-rotate-90'}`}
        />
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-line bg-paper/40 px-6 py-4">
          <p className="text-sm text-ink-muted">{description}</p>
          {requestBody && <FieldTable title="Request Body" fields={requestBody} />}
          {queryParams && <FieldTable title="Query Parameters" fields={queryParams} />}

          <div>
            <p className="mb-2 text-xs font-medium text-ink-muted">Response</p>
            {responseNote && <p className="mb-2 text-xs text-ink-muted">{responseNote}</p>}
            {response.startsWith('{') || response.startsWith('[') ? (
              <pre className="overflow-x-auto rounded-md bg-cobalt-tint p-3 font-mono text-xs text-ink">
                {response}
              </pre>
            ) : (
              <code className="inline-block rounded-md bg-cobalt-tint px-3 py-2 font-mono text-xs text-ink">
                {response}
              </code>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
