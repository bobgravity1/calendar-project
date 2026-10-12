import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TotalsByTask() {
    const footer = (
        <CardFooter className="mt-auto">
            <TabsList variant="line" className="contents">
                <TabsTrigger value="edit" buttonVariant="default" className="flex-1 data-active:hidden">Edit goals &amp; markers</TabsTrigger>
                <TabsTrigger value="totals" buttonVariant="default" className="flex-1 data-active:hidden">Back to totals</TabsTrigger>
            </TabsList>
            <Button type="button" variant="secondary" className="flex-1">Export CSV</Button>
        </CardFooter>
    )

    return (
        <Tabs defaultValue="totals" className="h-full">
            <TabsContent value="totals" className="h-full">
                <Card variant="glass-dark" className="h-full">
                    <CardHeader>
                        <CardTitle>Totals by task</CardTitle>
                        <CardDescription>Today, last 7 days, all time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Task</TableHead>
                                    <TableHead>Today</TableHead>
                                    <TableHead>7 days</TableHead>
                                    <TableHead>All time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Task name</TableCell>
                                    <TableCell>0</TableCell>
                                    <TableCell>0</TableCell>
                                    <TableCell>0</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Task name</TableCell>
                                    <TableCell>0</TableCell>
                                    <TableCell>0</TableCell>
                                    <TableCell>0</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Task name</TableCell>
                                    <TableCell>0</TableCell>
                                    <TableCell>0</TableCell>
                                    <TableCell>0</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                    {footer}
                </Card>
            </TabsContent>
            <TabsContent value="edit" className="h-full">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle variant="form">Edit goals &amp; markers</CardTitle>
                    </CardHeader>
                    <CardContent />
                    {footer}
                </Card>
            </TabsContent>
        </Tabs>
    )
}
