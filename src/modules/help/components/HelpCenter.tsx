"use client";

import { QuestionIcon } from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import { HelpCategoryFilter } from "@/modules/help/components/HelpCategoryFilter";
import { HelpFaqList } from "@/modules/help/components/HelpFaqList";
import { HelpSearch } from "@/modules/help/components/HelpSearch";
import { HELP_CATEGORIES } from "@/modules/help/constants/categories";
import { getHelpFaqForRole } from "@/modules/help/constants/faq";
import type { HelpCategoryId } from "@/modules/help/types/help";
import {
  countFaqByCategory,
  filterHelpFaq,
  isHelpCategoryId,
} from "@/modules/help/utils/search-faq";
import { useAuth } from "@/providers/AuthProvider";

function parseCategory(value: string | null): HelpCategoryId | "all" {
  if (!value || value === "all") return "all";
  return isHelpCategoryId(value) ? value : "all";
}

function buildHelpSearchParams(
  query: string,
  categoryId: HelpCategoryId | "all",
  openIds: string[],
): string {
  const params = new URLSearchParams();
  const trimmed = query.trim();
  if (trimmed) params.set("q", trimmed);
  if (categoryId !== "all") params.set("category", categoryId);
  if (openIds.length === 1) params.set("article", openIds[0]!);
  return params.toString();
}

const EMPTY_OPEN_IDS: string[] = [];

export function HelpCenter() {
  const { auth } = useAuth();
  const roleKey = auth?.membership?.roleKey;
  const faqItems = getHelpFaqForRole(roleKey);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const lastWrittenQuery = useRef<string | null>(null);

  const initialQuery = searchParams.get("q") ?? "";
  const initialCategory = parseCategory(searchParams.get("category"));
  const initialArticle = searchParams.get("article");

  const [query, setQuery] = useState(initialQuery);
  const [categoryId, setCategoryId] = useState<HelpCategoryId | "all">(
    initialCategory,
  );
  const [openIds, setOpenIds] = useState<string[]>(
    initialArticle ? [initialArticle] : [],
  );

  const deferredQuery = useDeferredValue(query);

  const counts = countFaqByCategory(faqItems);
  // Derive: if the role has no articles in the selected subject, treat as "all".
  const categoryUnavailable =
    categoryId !== "all" && (counts[categoryId] ?? 0) === 0;
  const effectiveCategoryId: HelpCategoryId | "all" = categoryUnavailable
    ? "all"
    : categoryId;
  const effectiveOpenIds = categoryUnavailable ? EMPTY_OPEN_IDS : openIds;

  const filtered = filterHelpFaq(faqItems, {
    query: deferredQuery,
    categoryId: effectiveCategoryId,
  });

  const activeCategory = HELP_CATEGORIES.find(
    (c) => c.id === effectiveCategoryId,
  );

  useEffect(() => {
    const next = buildHelpSearchParams(
      query,
      effectiveCategoryId,
      effectiveOpenIds,
    );
    if (next === lastWrittenQuery.current) return;
    if (next === searchParams.toString()) {
      lastWrittenQuery.current = next;
      return;
    }
    lastWrittenQuery.current = next;
    startTransition(() => {
      router.replace(next ? `${pathname}?${next}` : pathname, {
        scroll: false,
      });
    });
  }, [
    query,
    effectiveCategoryId,
    effectiveOpenIds,
    pathname,
    router,
    searchParams,
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <QuestionIcon className="size-5" weight="duotone" />
          </span>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Como podemos ajudar?
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Respostas para o seu papel na clínica. Escolha um assunto ou
              digite o que você procura.
            </p>
          </div>
        </div>

        <HelpSearch value={query} onChange={setQuery} />
      </header>

      <HelpCategoryFilter
        active={effectiveCategoryId}
        counts={counts}
        total={faqItems.length}
        onChange={(next) => {
          setCategoryId(next);
          setOpenIds([]);
        }}
      />

      {activeCategory ? (
        <p className="text-sm text-muted-foreground">
          {activeCategory.description}
        </p>
      ) : null}

      <p className="text-xs text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "pergunta" : "perguntas"}
        {deferredQuery.trim() ? ` para “${deferredQuery.trim()}”` : null}
      </p>

      <HelpFaqList
        items={filtered}
        openIds={effectiveOpenIds}
        onOpenChange={setOpenIds}
      />
    </div>
  );
}
