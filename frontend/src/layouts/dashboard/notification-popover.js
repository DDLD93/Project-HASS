
import PropTypes from "prop-types";
import { Box, MenuItem, MenuList, Popover } from "@mui/material";
import { useBearStore } from "src/contexts/store";

export const NotificationPopover = (props) => {
  const { anchorEl, onClose, open } = props;
  const { notifications } = useBearStore();

;

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: "left",
        vertical: "bottom",
      }}
      onClose={onClose}
      open={open}
      PaperProps={{ sx: { width: 200 } }}
    >
      <Box
        sx={{
          py: 1.5,
          px: 2,
        }}
      >
      </Box>
      <MenuList
        disablePadding
        dense
        sx={{
          p: "8px",
          "& > *": {
            borderRadius: 1,
          },
        }}
      >{notifications && notifications.map(notification=><MenuItem>{notification.name}</MenuItem>)}
      </MenuList>
    </Popover>
  );
};

NotificationPopover.propTypes = {
  anchorEl: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool.isRequired,
};
