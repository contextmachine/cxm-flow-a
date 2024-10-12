import WidgetPaper from "../../../../ui/scene/widgets-panel/blocks/widget-paper/widget-paper";
import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import TagExtension from "./tags-extension";
import { useViewer } from "@/components/services/scene-service/scene-provider";
import { ExtensionEntityInterface } from "@/components/services/extension-service/entity/extension-entity.types";
import { Tag, TagCategory } from "./tags-extension.types";
import { Box, Button, IconButton, Menu, MenuItem, Switch } from "@mui/material";
import { display } from "html2canvas/dist/types/css/property-descriptors/display";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import TagsExtension from "./tags-extension";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "react-error-boundary";
import Filter from "./blocks/filter/filter";

const PieChart = dynamic(
  () =>
    import(
      "@/components/ui/scene/widgets-panel/sidebars/tags-sidebar/blocks/pie-chart/pie-chart"
    ),
  {
    ssr: false,
  }
);

interface TagWidgetProps {
  isPreview?: boolean;
  extension: ExtensionEntityInterface;
}

const TagWidget: React.FC<TagWidgetProps> = ({ isPreview, extension }) => {
  const viewer = useViewer();
  const tagService = extension as TagsExtension;

  const [categories, setCategories] = useState<TagCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<TagCategory | undefined>(
    undefined
  );
  const [uniqueTags, setUniqueTags] = useState<Map<string, number>>(new Map());

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  useEffect(() => {
    const a = tagService.$categories.subscribe((c) =>
      setCategories([...c.values()])
    );
    const b = tagService.$activeCategory.subscribe((c) => setActiveCategory(c));
    const ts = tagService.$tags.subscribe((tags) => setTags(tags));
    const ut = tagService.$uniqueTags.subscribe((ut) => setUniqueTags(ut));

    return () => {
      a.unsubscribe();
      b.unsubscribe();
      ts.unsubscribe();
      ut.unsubscribe();
    };
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    const isActive = activeCategory?.name === categoryName;
    if (isActive) {
      tagService.setActiveCategory(null);
      return;
    }

    tagService.setActiveCategory(categoryName);
  };

  const [tags, setTags] = useState<Map<string, Tag>>(new Map());

  const items = useMemo(
    () => Array.from(uniqueTags).map(([name, value]) => ({ name, value })),
    [uniqueTags]
  );

  return (
    <WidgetPaper
      isPreview={isPreview}
      title={"Charts"}
      actionPanel={
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* <Switch size={"small"} onChange={() => {}} /> */}
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVertIcon
              sx={{
                fontSize: "20px",
              }}
            />
          </IconButton>

          <Menu
            anchorEl={menuAnchorEl}
            open={isMenuOpen}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>Option 1</MenuItem>
            <MenuItem onClick={handleMenuClose}>Option 2</MenuItem>
          </Menu>
        </Box>
      }
    >
      <Filter
        activeCategory={activeCategory}
        categories={categories}
        handleCategoryClick={handleCategoryClick}
        extension={tagService}
      />

      {activeCategory && (
        <ErrorBoundary FallbackComponent={FallbackComponent}>
          <PieChart
            items={items}
            options={{
              maxHeight: "max-content",
              legend: {
                maxItems: 15,
              },
            }}
            content={tags.size}
            type="pie"
            key={activeCategory?.name}
          />
        </ErrorBoundary>
      )}
    </WidgetPaper>
  );
};

function FallbackComponent({ error }: any) {
  return <div>Error loading chart: {error.message}</div>;
}

export default TagWidget;
