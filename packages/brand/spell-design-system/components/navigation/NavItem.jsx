import React from 'react';
export function NavItem({ icon, active, count, children, ...rest }) {
  return (
    <button type="button" className="sp-nav" aria-current={active ? 'page' : undefined} {...rest}>
      {icon && <span className="sp-nav__icon">{icon}</span>}
      <span>{children}</span>
      {count != null && <span className="sp-nav__count">{count}</span>}
    </button>
  );
}