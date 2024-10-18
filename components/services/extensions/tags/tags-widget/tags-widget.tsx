import WidgetPaper from "../../../../ui/scene/widgets-panel/blocks/widget-paper/widget-paper";
import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import TagExtension from "./tags-extension";
import { useViewer } from "@/components/services/scene-service/scene-provider";
import { ExtensionEntityInterface } from "@/components/services/extension-service/entity/extension-entity.types";
import { Tag, TagCategory, TagCondition } from "./tags-extension.types";
import { Box, Button, IconButton, Menu, MenuItem, Switch } from "@mui/material";
import { display } from "html2canvas/dist/types/css/property-descriptors/display";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import TagsExtension from "./tags-extension";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "react-error-boundary";
import Filter from "./blocks/filter/filter";
import CheckIcon from "@mui/icons-material/Check";

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
  const [subFilters, setSubFilters] = useState<TagCondition[]>([]);
  const [activeCategory, setActiveCategory] = useState<TagCategory | undefined>(
    undefined
  );
  const [uniqueTags, setUniqueTags] = useState<Map<string, number>>(new Map());

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  const [isGroupingEnabled, setIsGroupingEnabled] = useState(false);
  const [isMatrixWorldEnabled, setIsMatrixWorldEnabled] = useState(false);

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

    const ge = tagService.enableGrouping$.subscribe(setIsGroupingEnabled);
    const me = tagService.applyMatrixWorld$.subscribe(setIsMatrixWorldEnabled);

    const sf = tagService.$subFilters.subscribe((sf) => setSubFilters(sf));

    return () => {
      a.unsubscribe();
      b.unsubscribe();
      ts.unsubscribe();
      ut.unsubscribe();
      ge.unsubscribe();
      me.unsubscribe();
      sf.unsubscribe();
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

  const handleGroupingToggle = () => {
    tagService.setGroupingEnabled(!isGroupingEnabled);
    handleMenuClose();
  };

  const handleMatrixWorldToggle = () => {
    tagService.setApplyMatrixWorld(!isMatrixWorldEnabled);
    handleMenuClose();
  };

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
            <MenuItem onClick={handleMatrixWorldToggle}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Box sx={{ minWidth: "12px", minHeight: "12px" }}>
                  {isMatrixWorldEnabled ? <CheckIcon /> : null}
                </Box>
                <Box>
                  <strong>Apply Matrix World</strong>
                  <div style={{ opacity: 0.5 }}>
                    Improves accuracy but may affect performance.
                  </div>
                </Box>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleGroupingToggle}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Box sx={{ minWidth: "12px", minHeight: "12px" }}>
                  {isGroupingEnabled ? <CheckIcon /> : null}
                </Box>
                <Box>
                  <strong>Enable Grouping</strong>
                  <div style={{ opacity: 0.5 }}>Toggle grouping of tags.</div>
                </Box>
              </Box>
            </MenuItem>
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
            activeItems={subFilters.map((sf) => sf.name)}
            options={{
              maxHeight: "max-content",
              legend: {
                maxItems: 15,
              },
              onLegendClick: (name) => {
                const existingFilter = subFilters.find(
                  (sf) => sf.name === name
                );
                if (!existingFilter) {
                  extension.addSubFilter({
                    name: name,
                    operator: "EQUAL",
                    enabled: true,
                  });
                } else {
                  extension.removeSubFilter(existingFilter);
                }
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
