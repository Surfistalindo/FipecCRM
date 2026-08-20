import { ChevronDown, PanelLeftClose, PanelLeftOpen, Search, X } from "lucide-react";
import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";

import { GROUP_ICONS, GROUP_ORDER, MODULES_BY_GROUP } from "@/config/modules";
import { cn } from "@/lib/utils";

const OPEN_GROUPS_KEY = "erp:sidebar:open-groups";

function loadOpenGroups(): Set<string> {
  try {
    const raw = localStorage.getItem(OPEN_GROUPS_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {
    /* ignore */
  }
  return new Set(GROUP_ORDER);
}

export function SidebarContent({
  onNavigate,
  collapsed = false,
  onToggleCollapsed,
}: {
  onNavigate?: () => void;
  /** modo "rail" — so icones, usado no desktop */
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}) {
  const location = useLocation();
  const [openGroups, setOpenGroups] = React.useState<Set<string>>(loadOpenGroups);
  const [search, setSearch] = React.useState("");

  // Garante que o grupo da rota ativa sempre comece aberto.
  React.useEffect(() => {
    const activeGroup = GROUP_ORDER.find((g) =>
      MODULES_BY_GROUP[g].some((m) => m.path === location.pathname),
    );
    if (activeGroup) {
      setOpenGroups((prev) => (prev.has(activeGroup) ? prev : new Set(prev).add(activeGroup)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persist(next: Set<string>) {
    setOpenGroups(next);
    try {
      localStorage.setItem(OPEN_GROUPS_KEY, JSON.stringify([...next]));
    } catch {
      /* ignore */
    }
  }

  function toggleGroup(group: string) {
    const next = new Set(openGroups);
    next.has(group) ? next.delete(group) : next.add(group);
    persist(next);
  }

  const query = search.trim().toLowerCase();
  const isSearching = query.length > 0;

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Marca */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center gap-3 border-b px-5",
          collapsed && "justify-center px-0",
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-primary">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path
              d="M4 17 10 11 14 15 20 7"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 7h5v5"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate font-display text-[0.95rem] font-bold tracking-tight">
              ERP Web
            </p>
            <p className="truncate text-[0.7rem] font-medium text-muted-foreground">
              Gestão Empresarial
            </p>
          </div>
        )}
        {!collapsed && onToggleCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label="Recolher menu"
            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:flex"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Busca rapida */}
      {!collapsed && (
        <div className="shrink-0 px-3 pt-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar módulo..."
              className="h-8 w-full rounded-lg border border-transparent bg-muted/70 pl-8 pr-7 text-xs font-medium outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:bg-background"
            />
            {isSearching && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navegacao: menu (grupo) -> submenu (modulos) */}
      <nav className={cn("flex-1 overflow-y-auto py-4", collapsed ? "space-y-2 px-2" : "space-y-1 px-3")}>
        {GROUP_ORDER.map((group) => {
          const GroupIcon = GROUP_ICONS[group];
          const items = MODULES_BY_GROUP[group].filter(
            (item) => !isSearching || item.label.toLowerCase().includes(query),
          );
          if (items.length === 0) return null;

          const isOpen = collapsed || isSearching || openGroups.has(group);

          return (
            <div key={group} className={cn(!collapsed && "pb-1")}>
              {collapsed ? (
                <div className="mb-1.5 flex items-center justify-center border-t pt-2 first:border-t-0 first:pt-0">
                  <GroupIcon className="h-3.5 w-3.5 text-muted-foreground/60" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => toggleGroup(group)}
                  className="group flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left transition-colors hover:bg-accent/60"
                >
                  <GroupIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                  <span className="flex-1 truncate text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">
                    {group}
                  </span>
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[0.62rem] font-semibold text-muted-foreground/70">
                    {items.length}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-transform duration-200",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
              )}

              <div
                className={cn(
                  "grid transition-all duration-200 ease-out",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <div className={cn("relative space-y-0.5", !collapsed && "ml-[1.05rem] mt-0.5 pl-3.5")}>
                    {/* linha vertical da arvore de submenu */}
                    {!collapsed && (
                      <span
                        aria-hidden
                        className="absolute bottom-1.5 left-0 top-0.5 w-px bg-border"
                      />
                    )}
                    {items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          end={item.path === "/"}
                          onClick={onNavigate}
                          title={collapsed ? item.label : undefined}
                          className={({ isActive }) =>
                            cn(
                              "group/item relative flex items-center gap-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                              collapsed ? "justify-center px-0 py-2.5" : "px-2.5 py-1.5",
                              isActive
                                ? "bg-primary/10 text-primary"
                                : "text-foreground/65 hover:bg-accent hover:text-foreground",
                            )
                          }
                        >
                          {({ isActive }) => (
                            <>
                              {!collapsed && (
                                <span
                                  aria-hidden
                                  className={cn(
                                    "absolute -left-3.5 top-1/2 h-px w-3 -translate-y-1/2 bg-border",
                                  )}
                                />
                              )}
                              <span
                                className={cn(
                                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors",
                                  isActive
                                    ? "bg-primary/15 text-primary"
                                    : "text-muted-foreground group-hover/item:text-foreground",
                                )}
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </span>
                              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                              {!collapsed && isActive && (
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                              )}
                            </>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {isSearching &&
          GROUP_ORDER.every(
            (g) => !MODULES_BY_GROUP[g].some((m) => m.label.toLowerCase().includes(query)),
          ) && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              Nenhum módulo encontrado.
            </p>
          )}
      </nav>

      {/* Rodape */}
      <div className={cn("shrink-0 border-t p-3", collapsed && "flex justify-center")}>
        {collapsed ? (
          onToggleCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label="Expandir menu"
              className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:flex"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          )
        ) : (
          <div className="rounded-lg bg-muted/50 px-3 py-2.5">
            <p className="text-[0.7rem] font-medium text-muted-foreground">
              Versão 1.0 · Produção
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
