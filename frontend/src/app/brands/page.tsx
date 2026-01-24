import { BRANDS, SCORES } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp } from 'lucide-react';

export default function BrandsPage() {
    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
                    <p className="text-gray-600 mt-2">Manage and track all your brands</p>
                </div>

                {/* Brand List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {BRANDS.map((brand) => {
                        const score = SCORES[brand.id];
                        const scoreColor = score.composite >= 80 ? 'text-green-600' : score.composite >= 50 ? 'text-yellow-600' : 'text-red-600';

                        return (
                            <Card key={brand.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-700 rounded-lg font-bold text-lg">
                                                {brand.logo}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                                                <Badge variant="outline" className="mt-1">{brand.category}</Badge>
                                            </div>
                                        </div>
                                        <div className={`text-2xl font-bold ${scoreColor}`}>
                                            {score.composite}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Visibility:</span>
                                            <span className="font-semibold">{score.visibility}%</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Citation:</span>
                                            <span className="font-semibold">{score.citation}%</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Representation:</span>
                                            <span className="font-semibold">{score.representation}%</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Intent:</span>
                                            <span className="font-semibold">{score.intent}%</span>
                                        </div>
                                    </div>

                                    {brand.domain && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <p className="text-xs text-gray-500">{brand.domain}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Coming Soon */}
                <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <Package className="w-12 h-12 text-indigo-600" />
                            <div>
                                <h3 className="font-semibold text-gray-900 text-lg">More Features Coming Soon</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Brand detail pages, competitor comparison, and historical trends will be added in the next update.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
