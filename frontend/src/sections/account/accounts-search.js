import { useState } from "react";
import { Card, OutlinedInput, InputAdornment, SvgIcon } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
// import { useLocation } from "react-router-dom";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const AccountSearch = () => {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathName = usePathname();

  const handleSearch = (e) => {
    const params = new URLSearchParams(searchParams);

    if (e.target.value) {
      e.target.value.length > 2 && params.set("query", e.target.value);
    } else {
      params.delete("query");
    }

    replace(`${pathName}?${params}`);
  };

  return (
    <Card sx={{ p: 2 }}>
      <OutlinedInput
        onChange={handleSearch}
        fullWidth
        placeholder="Search Users"
        startAdornment={
          <InputAdornment position="start">
            <SvgIcon color="action" fontSize="small">
              <SearchIcon />
            </SvgIcon>
          </InputAdornment>
        }
        sx={{ maxWidth: 500 }}
      />
    </Card>
  );
};
