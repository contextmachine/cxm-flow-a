import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Box, Typography, IconButton, TextField, Chip } from "@mui/material";
import { ExpandMore, FilterAlt } from "@mui/icons-material";
import SelectWithSearch from "@/components/ui/shared/select-with-search";
import { TagCategory } from "../../tags-extension.types";
import { set } from "lodash";
import CheckIcon from "@mui/icons-material/Check";

// Styled components
const FilterContainer = styled(Box)<{
  $active: "active" | "inactive";
}>`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  width: 100%;

  border-radius: 9px;
  padding: 5px;

  ${({ $active }) =>
    $active === "active" &&
    `
    background-color: #F3F3F3;
    
  `}
`;

const SectionHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  width: 100%;
`;

const FilterContent = styled(Box)<{
  expanded: boolean;
}>`
  display: ${({ expanded }) => (expanded ? "flex" : "none")};
  flex-direction: column;
  margin-top: 8px;
  gap: 8px;
`;

const Filter = ({
  activeCategory,
  categories,
  handleCategoryClick,
}: {
  activeCategory: TagCategory | undefined;
  categories: TagCategory[];
  handleCategoryClick: (category: string) => void;
}) => {
  const [attributeExpanded, setAttributeExpanded] = useState(false);
  const [filterExpanded, setFilterExpanded] = useState(false);

  const [attributeValue, setAttributeValue] = useState<string>("");

  const toggleExpanded = (type: "attribute" | "filter") => {
    if (type === "attribute") {
      setAttributeExpanded(!attributeExpanded);
    } else {
      setFilterExpanded(!filterExpanded);
    }
  };

  const [attributeHistory, setAttributeHistory] = useState<TagCategory[]>([]);
  useEffect(() => {
    if (activeCategory) {
      const historyIncludes = attributeHistory.some(
        (c) => c.name === activeCategory.name
      );
      if (!historyIncludes) {
        setAttributeHistory([...attributeHistory, activeCategory]);
      }
    }
  }, [activeCategory]);

  useEffect(() => {
    setAttributeValue("");
  }, [activeCategory]);

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      <FilterContainer $active={activeCategory ? "active" : "inactive"}>
        {/* What to Show Section */}
        <SectionHeader onClick={() => toggleExpanded("attribute")}>
          <Box>
            <b>What to show</b>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            {activeCategory ? activeCategory.name : "All"}
            <ExpandMore
              sx={{
                transform: attributeExpanded
                  ? "rotate(-90deg)"
                  : "rotate(0deg)",
                transition: "transform 0.3s",
                fontSize: "16px",
              }}
            />
          </Box>
        </SectionHeader>
        <FilterContent expanded={attributeExpanded}>
          {attributeHistory.map((c) => (
            <Box
              sx={{
                background: "#ffffff",
                padding: "5px",
                borderRadius: "9px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => handleCategoryClick(c.name)}
            >
              {c.name}

              {activeCategory?.name === c.name && (
                <CheckIcon
                  sx={{
                    fontSize: "14px",
                  }}
                />
              )}
            </Box>
          ))}

          <SelectWithSearch
            options={categories.map((c) => ({ value: c.name }))}
            placeholder="Add new attribute"
            filterInput={attributeValue}
            onSelect={(e) => {
              handleCategoryClick(e.value);
            }}
            setFilterInput={(e) => {
              setAttributeValue(e);
            }}
          />
        </FilterContent>
      </FilterContainer>

      {/* TODO: Ilia Kuzmin. Either remove this section or enhance it */}
      {/* <FilterContainer $active="inactive">
        <SectionHeader onClick={() => toggleExpanded("filter")}>
          <Box>
            <b>Filter</b>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            {activeCategory ? activeCategory.name : "All"}
            <ExpandMore
              sx={{
                transform: filterExpanded ? "rotate(-90deg)" : "rotate(0deg)",
                transition: "transform 0.3s",
                fontSize: "16px",
              }}
            />
          </Box>
        </SectionHeader>
        <FilterContent expanded={filterExpanded}>
          {filterActive ? (
            <>
              <Chip label="Значение 1" onDelete={() => {}} />
              <Chip label="Значение 2" onDelete={() => {}} />
            </>
          ) : (
            <TextField
              variant="outlined"
              size="small"
              placeholder="Добавить атрибут"
              onBlur={applyFilter}
            />
          )}
        </FilterContent>
      </FilterContainer> */}
    </Box>
  );
};

export default Filter;
