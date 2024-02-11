import { ColumnDef } from "@tanstack/react-table"
import { OBU } from "@/types/obu"

import Heartbeat from "./heartbeat"
import Speed from "./speed"
// import Location from "./location"

export const columns: ColumnDef<OBU>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "heartbeat",
        header: "Heartbeat",
        cell: ({ row }) => {
            const id = row.getValue<string>('id')
            const heartbeat = row.getValue<any>('heartbeat')
            return <Heartbeat id={id} heartbeat={heartbeat} />
        }
    },
    {
        accessorKey: "speed",
        header: "Speed",
        cell: ({ row }) => {
            const speed = row.getValue<number>('speed')
            const id = row.getValue<string>('id')
            return <Speed id={id} speed={speed} />
        }
    },
    // {
    //     accessorKey: "location",
    //     header: "Location",
    //     cell: () => {
    //         return <Location />
    //     },
    // }
]