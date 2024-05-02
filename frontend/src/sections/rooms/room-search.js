import MagnifyingGlassIcon from "@heroicons/react/24/solid/MagnifyingGlassIcon";
import { Card, InputAdornment, OutlinedInput, SvgIcon } from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const RoomSearch = () => {
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
        defaultValue=""
        fullWidth
        placeholder="Search Rooms"
        onChange={handleSearch}
        startAdornment={
          <InputAdornment position="start">
            <SvgIcon color="action" fontSize="small">
              <MagnifyingGlassIcon />
            </SvgIcon>
          </InputAdornment>
        }
        sx={{ maxWidth: 500 }}
      />
    </Card>
  );
};
