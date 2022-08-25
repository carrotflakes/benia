
export const Hamburger = ({ color = '#eee' }: { color?: string; }) => {
  return (
    <div style={{ display: 'inline-block', position: 'relative', width: 10, height: 10 }}>
      <div style={{ height: 2, background: color }}></div>
      <div style={{ marginTop: 2, height: 2, background: color }}></div>
      <div style={{ marginTop: 2, height: 2, background: color }}></div>
    </div>
  );
};
