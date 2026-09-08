export function Placeholder({ children }: { children: string }) {
  return <span className="font-medium italic text-violet">{children}</span>
}

export function PathTemplate({ path }: { path: string }) {
  const segments = path.split('/')
  return (
    <>
      {segments.map((segment, index) => (
        <span key={index}>
          {index > 0 && '/'}
          {/^\{.*\}$/.test(segment) ? <Placeholder>{segment}</Placeholder> : segment}
        </span>
      ))}
    </>
  )
}
