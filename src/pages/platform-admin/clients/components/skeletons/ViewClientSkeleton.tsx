import React from 'react';
import { ShadowCard } from '../../../../../ui/ShadowCard';
import { Skeleton } from '../../../../../ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../../ui/Table';

const ViewClientSkeleton: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Page Header Skeleton */}
            <div className="flex items-center justify-between mb-8">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
            </div>

            {/* Profile Card Skeleton */}
            <ShadowCard className="p-6 border border-gray-100 shadow-sm rounded-2xl bg-white space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-6 w-48" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex items-center gap-4">
                            <Skeleton className="w-10 h-10 rounded-xl" />
                            <div className="space-y-1">
                                <Skeleton className="h-3 w-32" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Skeleton className="w-10 h-10 rounded-xl" />
                            <div className="space-y-1">
                                <Skeleton className="h-3 w-32" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </div>
                    </div>
                </div>
            </ShadowCard>

            {/* Companies Table Skeleton */}
            <ShadowCard className="overflow-hidden border border-gray-100 shadow-sm rounded-2xl bg-white space-y-4">
                <div className="px-6 pt-6">
                    <Skeleton className="h-4 w-48" />
                </div>

                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="py-4 px-6"><Skeleton className="h-4 w-12" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                            <TableHead className="text-right px-6"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <TableRow key={i}>
                                <TableCell className="px-6"><Skeleton className="h-4 w-4" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                <TableCell className="text-right px-6"><Skeleton className="h-9 w-28 ml-auto rounded-xl" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ShadowCard>
        </div>
    );
};

export default ViewClientSkeleton;
