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

    return () => {
      a.unsubscribe();
      b.unsubscribe();
      ts.unsubscribe();
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
      {/* TODO: Remove within the next version */}
      {/* <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "3px",
          width: "100%",
        }}
      >
        {categories.map((c, index) => (
          <Button
            key={index}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              pointerEvents: "all",
            }}
            data-active={activeCategory?.name === c.name}
            onClick={() => handleCategoryClick(c.name)}
            color="secondary"
            variant="contained"
            size="large"
          >
            {c.name}
          </Button>
        ))}
      </Box> */}

      <Filter
        activeCategory={activeCategory}
        categories={categories}
        handleCategoryClick={handleCategoryClick}
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

const Tabs = styled.div<{ $activeTab: number }>`
  width: 100%;
  display: grid;
  grid-template-columns: 50% 50%;
  background-color: var(--main-bg-color);
  height: 30px;
  border-radius: 9px;
  padding: 3px;

  .tab {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
  }
  .tab.active {
    background-color: var(--paper-bg-color);
    border-radius: 6px;
    box-shadow: 0px 0px 9px rgba(0, 0, 0, 0.1);
  }
`;

const OutlinerSearch = styled.div`
  width: 100%;
  font-size: 12px;
  display: flex;
  min-height: 25px;
  display: flex;
  justify-content: start;
  width: 100%;
  border-radius: 9px;
  padding: 2px;
  background-color: var(--select-bg-color);
  border: 1px solid var(--box-border-color);

  input {
    width: 100%;
    border: 0px;
    background-color: transparent;
    &:focus-visible {
      outline: -webkit-focus-ring-color auto 0px;
    }
  }
  .search-icon {
    margin-right: 3px;
    align-self: center;
    font-size: 14px;
    fill: grey;
  }

  .clear-button {
    margin-right: 3px;
    * {
      font-size: 14px;
      fill: grey;
    }
  }
`;

const TreeContainer = styled.div`
  width: 100%;
  display: block;
  flex-direction: column;
  gap: 6px;
  max-height: 500px;
  min-height: 150px;
  overflow: auto;
`;
