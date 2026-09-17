import json

def hanoi_solver(n):
    rods = {
        "A": list(range(n, 0, -1)),
        "B": [],
        "C": []
    }

    def format_state():
        return f"{rods['A']} {rods['B']} {rods['C']}"

    history = [format_state()]

    def solve(disks, source, target, auxiliary):
        if disks == 0:
            return
        solve(disks - 1, source, auxiliary, target)
        rods[target].append(rods[source].pop())
        history.append(format_state())
        solve(disks - 1, auxiliary, target, source)

    solve(n, "A", "C", "B")
    return "\n".join(history)

def get_hanoi_steps(n):
    """Returns an array of state snapshots [[A], [B], [C]] for visualization."""
    rods = {
        "A": list(range(n, 0, -1)),
        "B": [],
        "C": []
    }
    steps = [[list(rods["A"]), list(rods["B"]), list(rods["C"])]]

    def solve(disks, source, target, auxiliary):
        if disks == 0:
            return
        solve(disks - 1, source, auxiliary, target)
        rods[target].append(rods[source].pop())
        steps.append([list(rods["A"]), list(rods["B"]), list(rods["C"])])
        solve(disks - 1, auxiliary, target, source)

    solve(n, "A", "C", "B")
    return json.dumps(steps)