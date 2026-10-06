import { Children, cloneElement, isValidElement, type CSSProperties, type HTMLAttributes, type ReactElement, type ReactNode } from "react";

type Props = HTMLAttributes<HTMLHeadingElement> & { as?: "h1" | "h2"; children: ReactNode };
const labelText = (children: ReactNode): string => Children.toArray(children).map(child => {
  if (typeof child === "string" || typeof child === "number") return String(child);
  if (isValidElement<{ children?: ReactNode }>(child)) return child.type === "br" ? " " : labelText(child.props.children);
  return "";
}).join("");

export default function LandingHeading({ as: Tag = "h2", children, ...props }: Props) {
  let index = 0;
  const split = (content: ReactNode): ReactNode => Children.map(content, child => {
    if (typeof child === "string" || typeof child === "number") return String(child).split(/(\s+)/).map((word, wordIndex) => /^\s+$/.test(word) ? word : <span className="landing-motion-word" aria-hidden="true" key={wordIndex}>{Array.from(word).map((char, charIndex) => <span style={{ "--char-delay": `${Math.min(index++, 65) * 12}ms` } as CSSProperties} key={charIndex}>{char}</span>)}</span>);
    if (isValidElement<{ children?: ReactNode }>(child) && child.props.children) return cloneElement(child as ReactElement<{ children: ReactNode }>, { children: split(child.props.children) });
    return child;
  });
  return <Tag {...props} aria-label={labelText(children).replace(/\s+/g, " ").trim()} data-reveal="heading">{split(children)}</Tag>;
}
