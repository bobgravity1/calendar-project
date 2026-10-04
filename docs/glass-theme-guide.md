# Glass theme guide

## The mental model

The theme has two layers. Color tokens in `src/styles/style.css` define values shared across the app. A component variant decides which of those values and utilities a particular component uses. Installing a shadcn/ui component copies its source into `src/components/ui/`, so adding a variant there changes every use of that component without adding a `className` override at each call site.

This project already has `bg-glass-light` and `bg-glass-dark` utilities in `src/styles/style.css`. The light surface uses the translucent white `--glass-light` value; the dark surface uses `--card`. `--card-foreground` supplies white text. The `secondary` Button variant happens to use `bg-glass-light`, but `--secondary` is a different color token. Name a glass variant for the surface it produces, not for the Button hierarchy.

The primary scheme works the same way. `bg-primary` is jet black, `text-primary-foreground` is white, and `hover:bg-primary-hover` is `#2C2C2C`. An imported component that uses `bg-primary` picks up black automatically. Its hover uses the exact lighter shade only when its source references `hover:bg-primary-hover`; a component with `hover:bg-primary/90` still follows its own hover rule. `text-primary` means black text, while `text-primary-foreground` means text on a black primary surface.

## Current Card status

`src/components/ui/card.tsx` exists, but nothing currently imports it. The calendar uses `<article>` elements with `bg-glass-light` directly. The Card component has a `size` prop and no `variant` prop yet. This guide does not change either component.

To add Card variants later, put a surface map beside `Card`:

```tsx
const surfaces = {
  default: "bg-card",
  "glass-light": "bg-glass-light",
  "glass-dark": "bg-glass-dark",
} as const
```

Give `Card` a `variant` prop typed as `keyof typeof surfaces`, default it to `"default"`, and pass `surfaces[variant]` into its existing `cn(...)` call. Remove `bg-card` from Card's shared class string first: otherwise the default background and the chosen glass background compete. Keep its spacing, size behavior, and child components as they are. You would then use `<Card variant="glass-light">...</Card>` or `<Card variant="glass-dark">...</Card>`.

The calendar's `<article>` tags carry document meaning and layout classes. Deciding to use `Card` there is a separate step; adding Card variants alone does not require changing the calendar markup.

## Example: adding glass Tabs

The [shadcn/ui Base UI Tabs documentation](https://ui.shadcn.com/docs/components/base/tabs) shows the `Tabs` → `TabsList` → `TabsTrigger` structure and puts the built-in `variant="line"` on `TabsList`. That makes `TabsList` the natural home for a glass surface variant. The [official Base UI Tabs source](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/bases/base/ui/tabs.tsx) has a `tabsListVariants` map, passes its `variant` to `TabsList`, and uses `data-active` for the selected trigger. Your installed file may differ with the project's selected shadcn style, so inspect it after installation.

Install Tabs with Bun from the project root:

```sh
bunx shadcn@latest add tabs
```

Open the generated `src/components/ui/tabs.tsx`. Find the `variant` choices for `TabsList` (usually in `tabsListVariants`) and keep the existing `default` and `line` choices. Add the two surface choices there:

```tsx
"glass-light": "bg-glass-light text-card-foreground",
"glass-dark": "bg-glass-dark text-card-foreground",
```

This styles the list container. Next inspect `TabsTrigger`: the generated trigger often sets its own text color and selected background, so the list's white text will not necessarily reach it by inheritance. Keep its focus, disabled, and keyboard behavior. Add styles scoped to a glass list for inactive text and its selected state. In the current official Base UI source, the selected state is `data-active`, and `TabsList` exposes `data-variant` for a parent selector. The shape is:

```tsx
"group-data-[variant=glass-light]/tabs-list:text-card-foreground/70",
"group-data-[variant=glass-light]/tabs-list:data-active:bg-primary",
"group-data-[variant=glass-light]/tabs-list:data-active:text-primary-foreground",
```

Repeat those three rules for `glass-dark`. If the generated component uses a different selected-state attribute, use that attribute instead of `data-active`. A selected tab then has a black primary surface and white label; the glass list remains behind it.

Use the result through the component API:

```tsx
<Tabs defaultValue="calendar">
  <TabsList variant="glass-light">
    <TabsTrigger value="calendar">Calendar</TabsTrigger>
    <TabsTrigger value="stats">Stats</TabsTrigger>
  </TabsList>
</Tabs>
```

The principle for any newly imported shadcn component is to find the element that owns the visual surface, add a variant to that component's source, and map the variant to `bg-glass-light` or `bg-glass-dark`. Then check child elements with explicit colors or selected-state styles. Tokens provide shared values; variants determine where those values apply.
