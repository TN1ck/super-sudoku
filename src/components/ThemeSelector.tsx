import * as React from "react";
import clsx from "clsx";
import {useTranslation} from "react-i18next";
import {useTheme} from "src/context/ThemeContext";
import {THEMES} from "src/lib/themes";

const ThemeSelector: React.FC = () => {
  const {theme, setTheme} = useTheme();
  const {t} = useTranslation();

  return (
    <div className="border-t border-border pt-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">{t("theme")}</div>
      <div className="grid grid-cols-2 gap-1.5" role="group" aria-label={t("theme")}>
        {THEMES.map((item) => {
          const isSelected = theme === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={isSelected}
              data-testid={`theme-option-${item.id}`}
              onClick={(e) => {
                setTheme(item.id);
                e.currentTarget.blur();
              }}
              className={clsx(
                "flex items-center gap-2 rounded-sm border px-2 py-1.5 text-left text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                isSelected
                  ? "border-accent bg-surface-subtle font-semibold text-ink ring-1 ring-accent"
                  : "border-border bg-surface text-ink-muted hover:bg-surface-subtle/60 hover:text-ink",
              )}
            >
              <span className="flex shrink-0 items-center -space-x-1" aria-hidden="true">
                {item.swatches.map((hex, index) => (
                  <span
                    key={index}
                    className="h-3.5 w-3.5 rounded-full border border-black/20"
                    style={{backgroundColor: hex}}
                  />
                ))}
              </span>
              <span className="truncate">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSelector;
