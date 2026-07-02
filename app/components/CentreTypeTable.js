import React from "react";

export default function CentreTypeTable({ centres = [] }) {

    const rowOrder = [
        "School Balvikas",
        "Urban Domestic Balvikas",
        "Rural Domestic Balvikas",
    ];

    const sortedCentres = [...centres].sort(
        ([a], [b]) => rowOrder.indexOf(a) - rowOrder.indexOf(b)
    );

    const totals = {
        group1: 0,
        group2: 0,
        group3: 0,
        group4: 0,
        total: 0,
    };

    sortedCentres.forEach(([, data]) => {
        totals.group1 += Number(data["Group I"] || 0);
        totals.group2 += Number(data["Group II"] || 0);
        totals.group3 += Number(data["Group III"] || 0);
        totals.group4 += Number(data["Pre-Sevadal or IV"] || 0);

        totals.total +=
            Number(data["Group I"] || 0) +
            Number(data["Group II"] || 0) +
            Number(data["Group III"] || 0) +
            Number(data["Pre-Sevadal or IV"] || 0);
    });

    return (
        <div className="overflow-x-auto rounded-xl border-2 border-black bg-white">
            <table className="w-full border-collapse">

                <thead>
                    <tr className="bg-black text-xs uppercase text-white">
                        <th className="px-6 py-4 text-left">Centre Type</th>
                        <th className="px-4 py-4 text-right">Group I</th>
                        <th className="px-4 py-4 text-right">Group II</th>
                        <th className="px-4 py-4 text-right">Group III</th>
                        <th className="px-4 py-4 text-right">Pre-Sevadal / IV</th>
                        <th className="px-6 py-4 text-right">Total</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                    {sortedCentres.map(([type, data]) => {

                        const total =
                            Number(data["Group I"] || 0) +
                            Number(data["Group II"] || 0) +
                            Number(data["Group III"] || 0) +
                            Number(data["Pre-Sevadal or IV"] || 0);

                        return (
                            <tr key={type} className="hover:bg-slate-50">

                                <td className="px-6 py-4 font-medium">
                                    {type}
                                </td>

                                <td className="px-4 py-4 text-right">
                                    {Number(data["Group I"] || 0)}
                                </td>

                                <td className="px-4 py-4 text-right">
                                    {Number(data["Group II"] || 0)}
                                </td>

                                <td className="px-4 py-4 text-right">
                                    {Number(data["Group III"] || 0)}
                                </td>

                                <td className="px-4 py-4 text-right">
                                    {Number(data["Pre-Sevadal or IV"] || 0)}
                                </td>

                                <td className="px-6 py-4 text-right font-semibold">
                                    {total}
                                </td>

                            </tr>
                        );
                    })}

                    <tr className="bg-slate-50 font-semibold border-t-2">
                        <td className="px-6 py-4">TOTAL</td>

                        <td className="px-4 py-4 text-right">
                            {totals.group1}
                        </td>

                        <td className="px-4 py-4 text-right">
                            {totals.group2}
                        </td>

                        <td className="px-4 py-4 text-right">
                            {totals.group3}
                        </td>

                        <td className="px-4 py-4 text-right">
                            {totals.group4}
                        </td>

                        <td className="px-6 py-4 text-right text-blue-600">
                            {totals.total}
                        </td>
                    </tr>

                </tbody>

            </table>
        </div>
    );
}