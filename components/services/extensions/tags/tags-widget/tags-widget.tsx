import WidgetPaper from "../../../../ui/scene/widgets-panel/blocks/widget-paper/widget-paper";
import styled from "styled-components";
import { useEffect, useState } from "react";
import TagExtension from "./tags-extension";
import { useViewer } from "@/components/services/scene-service/scene-provider";
import { ExtensionEntityInterface } from "@/components/services/extension-service/entity/extension-entity.types";
import { TagCategory } from "./tags-extension.types";
import { Box, Button, IconButton, Menu, MenuItem, Switch } from "@mui/material";
import { display } from "html2canvas/dist/types/css/property-descriptors/display";
import MoreVertIcon from "@mui/icons-material/MoreVert";

interface TagWidgetProps {
  isPreview?: boolean;
  extension: ExtensionEntityInterface;
}

const TagWidget: React.FC<TagWidgetProps> = ({ isPreview, extension }) => {
  const viewer = useViewer();
  const tagService = extension;

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
    const a = tagService.$categories.subscribe((c: TagCategory[]) =>
      setCategories([...c.values()])
    );

    const b = tagService.$activeCategory.subscribe(
      (c: TagCategory | undefined) => setActiveCategory(c)
    );

    return () => {
      a.unsubscribe();
      b.unsubscribe();
    };
  }, []);

  const handleCategoryClick = (category: TagCategory) => {
    const isActive = activeCategory?.name === category.name;
    if (isActive) {
      tagService.setActiveCategory(undefined);
      return;
    }

    tagService.setActiveCategory(category.name);
  };

  return (
    <WidgetPaper
      isPreview={isPreview}
      title={"Tags"}
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
      <Box
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
            onClick={() => handleCategoryClick(c)}
            color="secondary"
            variant="contained"
            size="large"
          >
            {c.name}
          </Button>
        ))}
      </Box>
    </WidgetPaper>
  );
};

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
