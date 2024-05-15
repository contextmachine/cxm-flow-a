import * as React from "react";
import { useEffect, useState } from "react";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import styled from "styled-components";
import { useViewsWidget } from "../../views-widget";
import { ViewStateItem } from "@/components/services/extension-service/extensions/camera-views-extension/camera-views-extension.db";

function not(a: readonly number[], b: readonly number[]) {
  return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a: readonly number[], b: readonly number[]) {
  return a.filter((value) => b.indexOf(value) !== -1);
}

const TransferSection: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const [checked, setChecked] = React.useState<readonly number[]>([]);
  const [left, setLeft] = React.useState<readonly number[]>([]);
  const [right, setRight] = React.useState<readonly number[]>([]);

  const { allViews, animationViews, extension } = useViewsWidget();
  const [viewsMap, setViewsMap] = useState(new Map<number, ViewStateItem>());

  useEffect(() => {
    const animationIds = animationViews.map((view: ViewStateItem) => view.id);
    const allIds = allViews.map((view: ViewStateItem) => view.id);

    const map = new Map<number, ViewStateItem>();
    allViews.forEach((view: ViewStateItem) => map.set(view.id, view));

    setViewsMap(map);

    setRight(animationIds);
    setLeft(not(allIds, animationIds));
  }, [allViews, animationViews]);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  const handleToggle = (value: number) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleAllRight = () => {
    setRight(right.concat(left));
    setLeft([]);
  };

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked));
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked));
    setRight(not(right, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const handleAllLeft = () => {
    setLeft(left.concat(right));
    setRight([]);
  };

  const save = async () => {
    await extension?.updateAnimationViews(
      right.map((id) => viewsMap.get(id)).filter((a) => a)
    );

    onClose();
  };

  const customList = (items: readonly number[]) => (
    <Wrapper>
      <Box
        sx={{
          maxHeight: 400,
          overflow: "auto",
          border: "1px solid var(--box-border-color)",
          borderRadius: "8px",
        }}
      >
        <List dense component="div" role="list">
          {items.map((value: number) => {
            const labelId = `transfer-list-item-${value}-label`;

            const view = viewsMap.get(value);

            return (
              <ListItemButton
                key={value}
                role="listitem"
                onClick={handleToggle(value)}
                sx={{ display: "flex", alignItems: "flex-start", gap: "8px" }}
              >
                <Box>
                  <Checkbox
                    size="small"
                    checked={checked.indexOf(value) !== -1}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{
                      "aria-labelledby": labelId,
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <Box
                    sx={{
                      width: "60px",
                      height: "40px",
                      background: view?.thumb
                        ? `url("${view?.thumb}")`
                        : "lightgrey",
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                      borderRadius: "4px",
                    }}
                  ></Box>

                  <Box
                    sx={{
                      overflow: "hidden",
                      width: "100%",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {view?.name || ""}
                  </Box>
                </Box>
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </Wrapper>
  );

  return (
    <>
      <GridWrapper>
        <Box sx={{ overflow: "hidden" }}>{customList(left)}</Box>
        <Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Button
              sx={{ width: "30px", minWidth: "30px" }}
              variant="outlined"
              size="small"
              onClick={handleAllRight}
              disabled={left.length === 0}
              aria-label="move all right"
            >
              ≫
            </Button>
            <Button
              sx={{ width: "30px", minWidth: "30px" }}
              variant="outlined"
              size="small"
              onClick={handleCheckedRight}
              disabled={leftChecked.length === 0}
              aria-label="move selected right"
            >
              &gt;
            </Button>
            <Button
              sx={{ width: "30px", minWidth: "30px" }}
              variant="outlined"
              size="small"
              onClick={handleCheckedLeft}
              disabled={rightChecked.length === 0}
              aria-label="move selected left"
            >
              &lt;
            </Button>
            <Button
              sx={{ width: "30px", minWidth: "30px" }}
              variant="outlined"
              size="small"
              onClick={handleAllLeft}
              disabled={right.length === 0}
              aria-label="move all left"
            >
              ≪
            </Button>
          </Box>
        </Box>
        <Box sx={{ overflow: "hidden" }}>{customList(right)}</Box>
      </GridWrapper>

      <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          size="medium"
          sx={{ minWidth: "100px" }}
          onClick={save}
        >
          Save
        </Button>
      </Box>
    </>
  );
};

const GridWrapper = styled.div`
  & {
    display: grid;
    width: 100%;
    overflow: hidden;
    grid-template-columns: 1fr 30px 1fr;
    gap: 8px;
    marginbottom: 12px;
  }

  & .MuiButton-root {
    /* any style is here */
  }
`;

const Wrapper = styled.div`
  &&& {
    &,
    & * {
      font-size: 12px;
    }

    & .MuiCheckbox-root {
      padding: 0;
    }
  }
`;

export default TransferSection;
