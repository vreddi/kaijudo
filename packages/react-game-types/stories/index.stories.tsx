import type { Meta, StoryObj } from "@storybook/react";
import { UtilityPage } from "@kaijudo/react-storybook";
import { Era, Rarity, Race } from "../src/index.js";

const meta = {
  title: "Utilities/Game Types",
  component: UtilityPage,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof UtilityPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TypesDocumentation: Story = {
  render: () => (
    <UtilityPage
      name="Game Types"
      description="TypeScript type definitions for Kaijudo game entities including eras, rarities, and races."
    >
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="space-y-12">
            {/* Era Section */}
            <section>
              <h2 className="text-3xl font-bold mb-4">Era</h2>
              <p className="text-gray-600 mb-6">
                Represents different periods in the Duel Masters franchise
                timeline.
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-4">
                  {Object.entries(Era).map(([key, value]) => (
                    <div
                      key={key}
                      className="border-b border-gray-200 pb-4 last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <code className="text-sm font-mono bg-white px-3 py-1 rounded border">
                          {key}
                        </code>
                        <span className="text-gray-500">=</span>
                        <code className="text-sm font-mono bg-white px-3 py-1 rounded border text-blue-600">
                          "{String(value)}"
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Rarity Section */}
            <section>
              <h2 className="text-3xl font-bold mb-4">Rarity</h2>
              <p className="text-gray-600 mb-6">
                Card rarity levels in the game.
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-4">
                  {Object.entries(Rarity).map(([key, value]) => (
                    <div
                      key={key}
                      className="border-b border-gray-200 pb-4 last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <code className="text-sm font-mono bg-white px-3 py-1 rounded border">
                          {key}
                        </code>
                        <span className="text-gray-500">=</span>
                        <code className="text-sm font-mono bg-white px-3 py-1 rounded border text-blue-600">
                          "{String(value)}"
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Race Section */}
            <section>
              <h2 className="text-3xl font-bold mb-4">Race</h2>
              <p className="text-gray-600 mb-6">
                Creature race types in the game.
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(Race).map(([key, value]) => (
                    <div
                      key={key}
                      className="border border-gray-200 rounded p-4 bg-white"
                    >
                      <div className="flex flex-col gap-2">
                        <code className="text-sm font-mono font-semibold">
                          {key}
                        </code>
                        <code className="text-xs font-mono text-blue-600">
                          "{String(value)}"
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </UtilityPage>
  ),
};
