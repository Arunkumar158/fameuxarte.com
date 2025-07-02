
interface SectionTitleProps {
  title: string;
  subtitle?: string;
  alignment?: "left" | "center";
}

const SectionTitle = ({
  title,
  subtitle,
  alignment = "center",
}: SectionTitleProps) => {
  return (
    <div className={`space-y-2 ${alignment === "center" ? "text-center" : "text-left"}`}>
      <h2 className="text-3xl font-bold md:text-4xl">{title}</h2>
      {subtitle && <p className="text-lg text-muted-foreground">{subtitle}</p>}
    </div>
  );
};

export default SectionTitle;
