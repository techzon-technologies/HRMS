import * as React from "react"
import {
    User,
    Car,
    Building,
    Search
} from "lucide-react"
import {
    Command, // Changed from CommandDialog
    CommandGroup,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { apiService } from "@/lib/api"

export function GlobalSearch() {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const navigate = useNavigate()
    const [employees, setEmployees] = useState<any[]>([])
    const [departments, setDepartments] = useState<any[]>([])
    const [vehicles, setVehicles] = useState<any[]>([])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [empData, deptData, vehicleData] = await Promise.all([
                apiService.employees.getAll(),
                apiService.departments.getAll(),
                apiService.vehicles.getAll()
            ])

            if (Array.isArray(empData)) setEmployees(empData)
            if (Array.isArray(deptData)) setDepartments(deptData)
            if (Array.isArray(vehicleData)) setVehicles(vehicleData)
        } catch (error) {
            console.error("Failed to fetch search data", error)
        }
    }

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        setSearchQuery("")
        command()
    }, [])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchQuery(value)
        setOpen(value.length > 0)
    }

    const filteredEmployees = employees.filter(emp =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredDepartments = departments.filter(dept =>
        dept.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredVehicles = vehicles.filter(v =>
        v.plateNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.plateNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const hasResults = filteredEmployees.length > 0 || filteredDepartments.length > 0 || filteredVehicles.length > 0

    return (
        <div className="relative w-full md:w-64 lg:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div>
                        <Input
                            placeholder="Search employees, departments..."
                            className="pl-9 w-full"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={() => { if (searchQuery.length > 0) setOpen(true) }}
                        />
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                    <Command>
                        <CommandList>
                            {!hasResults && (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                    No results found.
                                </div>
                            )}

                            {filteredEmployees.length > 0 && (
                                <CommandGroup heading="Employees">
                                    {filteredEmployees.slice(0, 5).map((emp) => (
                                        <CommandItem
                                            key={emp.id}
                                            onSelect={() => runCommand(() => navigate(`/employee-directory?search=${emp.firstName}`))}
                                        >
                                            <User className="mr-2 h-4 w-4" />
                                            <span>{emp.firstName} {emp.lastName}</span>
                                            <span className="ml-2 text-xs text-muted-foreground">{emp.department}</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}

                            {filteredDepartments.length > 0 && (
                                <>
                                    <CommandSeparator />
                                    <CommandGroup heading="Departments">
                                        {filteredDepartments.map((dept) => (
                                            <CommandItem
                                                key={dept.id}
                                                onSelect={() => runCommand(() => navigate(`/departments`))}
                                            >
                                                <Building className="mr-2 h-4 w-4" />
                                                <span>{dept.name}</span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </>
                            )}

                            {filteredVehicles.length > 0 && (
                                <>
                                    <CommandSeparator />
                                    <CommandGroup heading="Vehicles">
                                        {filteredVehicles.map((vehicle) => (
                                            <CommandItem
                                                key={vehicle.id}
                                                onSelect={() => runCommand(() => navigate(`/vehicle-management`))}
                                            >
                                                <Car className="mr-2 h-4 w-4" />
                                                <span>{vehicle.plateNumber || vehicle.plateNo} - {vehicle.make} {vehicle.model}</span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}
