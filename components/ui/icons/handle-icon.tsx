const HandleIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 512"
      data-v-870ae63a=""
      style={{ width: "8px" }}
    >
      <path
        fill="currentColor"
        d="M48 144a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm0 160a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM96 416A48 48 0 1 0 0 416a48 48 0 1 0 96 0zM208 144a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm48 112a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM208 464a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"
        data-v-870ae63a=""
      ></path>
    </svg>
  );
};

export const WidgetHandleIcon = () => {
  return (
    <div
      className="kanban-handle"
      style={{
        cursor: "grab",
        minWidth: "27px",
        maxWidth: "27px",
        maxHeight: "27px",
        minHeight: "27px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <HandleIcon />
    </div>
  );
};

export default HandleIcon;
