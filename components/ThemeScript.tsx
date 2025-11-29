export function ThemeScript() {
  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `
          try {
            document.documentElement.classList.add('dark');
          } catch (e) {}
        `,
      }}
    />
  );
}
