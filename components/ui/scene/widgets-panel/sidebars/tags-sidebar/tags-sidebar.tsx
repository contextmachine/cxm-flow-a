import { ExtensionEntityInterface } from "@/components/services/extension-service/entity/extension-entity.types";
import { Box } from "@mui/material";
import WidgetPaper from "../../blocks/widget-paper/widget-paper";
import { useEffect, useMemo, useState } from "react";
import {
  Tag,
  TagCategory,
} from "@/components/services/extensions/tags/tags-widget/tags-extension.types";
import TagsExtension from "@/components/services/extensions/tags/tags-widget/tags-extension";
import dynamic from "next/dynamic";
import { Tabs } from "../../../primitives/tabs/tabs";

const PieChart = dynamic(() => import("./blocks/pie-chart/pie-chart"), {
  ssr: false,
});

const outlinerTabs = [
  { name: "Pie chart", icon: <></> },
  { name: "Bar chart", icon: <></> },
];

const TagsSidebar: React.FC<{
  extension: ExtensionEntityInterface;
}> = ({ extension }) => {
  const [activeCategory, setActiveCategory] = useState<TagCategory | undefined>(
    undefined
  );

  const [tags, setTags] = useState<Map<string, Tag>>(new Map());

  const [tab, setTab] = useState(0);
  const onTabChange = (e: number) => {
    setTab(e);
  };

  useEffect(() => {
    const ext = extension as TagsExtension;

    const ps = ext.$activeCategory.subscribe((category) =>
      setActiveCategory(category)
    );

    const ts = ext.$tags.subscribe((tags) => setTags(tags));

    return () => {
      ps.unsubscribe();
      ts.unsubscribe();
    };
  }, [extension]);

  const items = useMemo(() => {
    const uniqueTags = new Map<string, number>();

    tags.forEach((tag) => {
      const label = tag.label;

      if (uniqueTags.has(label)) {
        uniqueTags.set(label, uniqueTags.get(label)! + 1);
      } else {
        uniqueTags.set(label, 1);
      }
    });

    return Array.from(uniqueTags).map(([name, value]) => ({ name, value }));
  }, [tags]);

  console.log("tab", tab);

  if (!activeCategory) return null;

  return (
    <>
      <Box
        data-type="properties-panel"
        sx={{
          display: "flex",
          flexDirection: "column",
          pointerEvents: "all !important",
        }}
      >
        <WidgetPaper isPreview={false} title={"Summary"}>
          <Tabs $activeTab={tab} className="outliner-tabs">
            {outlinerTabs.map((x, index) => (
              <div
                key={index}
                className={`tab ${tab === index ? "active" : ""}`}
                onClick={(e) => onTabChange(index)}
              >
                {x.icon}
                {x.name}
              </div>
            ))}
          </Tabs>

          {tab === 0 && (
            <PieChart
              items={items}
              options={{
                maxHeight: "max-content",
                legend: {
                  maxItems: 15,
                },
              }}
              type="pie"
              key={activeCategory?.name}
            />
          )}

          {tab === 1 && (
            <PieChart
              items={items}
              options={{
                maxHeight: "max-content",
                legend: {
                  maxItems: 15,
                },
              }}
              type="bar"
              key={activeCategory?.name}
            />
          )}
        </WidgetPaper>
      </Box>
    </>
  );
};

export default TagsSidebar;
