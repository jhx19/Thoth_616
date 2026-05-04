export function TopBar({
  title,
  initials = "AK",
}: {
  title: string;
  initials?: string;
}) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-line bg-card px-6">
      <h1 className="text-[18px] font-semibold text-ink">{title}</h1>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-magenta text-xs font-semibold text-white">
        {initials}
      </div>
    </header>
  );
}
