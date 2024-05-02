import React from "react";
// import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import Grow from "@mui/material/Grow"
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Divider,
    Modal,
    Unstable_Grid2 as Grid,
    Typography, Rating,
    InputAdornment,
    OutlinedInput,
    SvgIcon,
    TextField
} from "@mui/material";
import { configs } from 'src/config-variables';
import { useBearStore } from "src/contexts/store";



const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    height: 300,
    transform: "translate(-50%, -50%)",
    width: 350,
    bgcolor: "background.paper",
    border: "0px solid #000",
    boxShadow: 94,
    borderRadius: 1,
    p: 4,
};

export default function ReviewModal({openReview, setOpenReview, Obj }) {
    const [score, setScore] = React.useState(0);
    const [comment, setComment] = React.useState(null);
    const token = useBearStore(state => state.token);

    const submitData = async () => {
        try {
            const response = await fetch(`${configs.baseUrl}/review`, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${token}`
                },
                method: "POST",
                body: JSON.stringify({ score, comment, patientId: Obj.patientId, doctorId: Obj.doctorId, appointmentId: Obj._id, roomId: Obj.roomId })
            })
            if (!response.ok) {
                throw new Error(response.text())
            }
            return await response.json();

        } catch (error) {
            throw new Error(error.message);
        }
    }
    const handleSubmit = async () => {
        try {
            const result = await submitData();

            if (result.ok) {
                alert("Review sent successfully");
                setOpenReview(false);
            } else {
                alert(result.message)
            }
        } catch (error) {
            alert(error.message)
        }
    }


    return (
        <>
    <Button
        color="info"
        variant="contained"
        fullWidth
        onClick={() => setOpenReview(true)}
      >
        Review
      </Button>
        <Modal
            open={openReview}
            onClose={()=>setOpenReview(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            disableEnforceFocus
        >
            <Card sx={style}>
                <CardContent sx={{
                    pt: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                }}>
                    {/* <Grow
                    
                    > */}
                    <Typography
                        pt={5}
                        textAlign="center"
                        variant="h6"
                    >
                        Review Appointment
                    </Typography>
                    <Rating
                        value={score}
                        onChange={(event, newValue) => {
                            setScore(newValue);
                        }}
                    />
                    {score > 0 && score <= 3 ? <TextField
                        multiline
                        fullWidth
                        placeholder="Please give a feedback"
                        margin="dense"
                        onChange={e => setComment(e.target.value)}
                        size="medium"
                        sx={{
                            width: "90%",
                            px: "auto"
                        }}
                    /> : ""}
                    {/* </Grow> */}
                </CardContent>
                <CardActions sx={{ justifyContent: "center" }}>
                    <Button disable={score == 0 ? false : true} variant="contained" type="submit" onClick={handleSubmit}>
                        Save
                    </Button>
                    <Button variant="contained" type="submit" color="error"
                        onClick={()=>setOpenReview(false)}
                    >
                        Cancel
                    </Button>
                </CardActions>
            </Card>
        </Modal>
        </>
    );
}





