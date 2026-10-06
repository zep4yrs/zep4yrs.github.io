export default function SectionHead({
  num,
  title,
  sub,
}: {
  num: string
  title: string
  sub?: string
}) {
  return (
    <div className="section-head">
      <span className="num">{num}</span>
      <h2>{title}</h2>
      <span className="head-lead" aria-hidden="true" />
      {sub ? <span className="sub">{sub}</span> : null}
    </div>
  )
}
