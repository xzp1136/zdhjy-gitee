  (func (;43460;) (type 7) (param i32 i32 i32 i32 i32)
    (local i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 4
    global.set 0
    i32.const 4366763
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3376296
      call 2180
      i32.const 3408192
      call 2180
      i32.const 3359256
      call 2180
      i32.const 3385852
      call 2180
      i32.const 3387844
      call 2180
      i32.const 3389756
      call 2180
      i32.const 3387848
      call 2180
      i32.const 3385856
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3415776
      call 2180
      i32.const 4366763
      i32.const 1
      i32.store8
    end
    block  ;; label = @1
      local.get 0
      i32.load offset=92
      local.tee 5
      i32.const 0
      i32.lt_s
      br_if 0 (;@1;)
      local.get 5
      local.get 0
      i32.load offset=88
      local.tee 6
      i32.load offset=12
      i32.ge_s
      br_if 0 (;@1;)
      local.get 6
      local.get 5
      local.get 4
      i32.const 12
      i32.add
      i32.const 3385856
      i32.load
      call 50458
      local.get 4
      i32.load offset=12
      i32.load offset=12
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      i32.const 3359256
      i32.load
      local.tee 5
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 5
        call 60460
        i32.const 3359256
        i32.load
        local.set 5
      end
      i32.const 3376296
      i32.load
      local.set 6
      local.get 5
      i32.load offset=92
      i32.load
      local.set 5
      local.get 4
      local.get 2
      i32.store offset=12
      local.get 5
      local.get 4
      i32.const 12
      i32.add
      local.get 4
      i32.const 8
      i32.add
      local.get 6
      call 34434
      local.get 4
      i32.load offset=8
      local.set 5
      local.get 0
      i32.load offset=88
      local.get 0
      i32.load offset=92
      local.get 4
      i32.const 12
      i32.add
      i32.const 3385856
      i32.load
      call 50458
      local.get 4
      i32.load offset=12
      local.get 3
      local.get 4
      i32.const 12
      i32.add
      i32.const 3387848
      i32.load
      call 50458
      local.get 5
      i32.load offset=16
      local.get 4
      i32.load offset=12
      local.get 4
      i32.const 12
      i32.add
      i32.const 3389756
      i32.load
      call 50458
      local.get 4
      i32.load offset=12
      local.set 0
      local.get 1
      local.get 4
      i32.const 12
      i32.add
      i32.const 3408192
      i32.load
      call 45354
      local.get 4
      i32.load offset=12
      local.set 5
      i32.const 0
      call 56067
      i32.load offset=252
      local.get 0
      i32.const 0
      call 48049
      i32.const 3415776
      i32.load
      call 24700
      local.set 0
      i32.const 3360788
      i32.load
      local.tee 1
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 1
        call 60460
      end
      local.get 0
      i32.const 0
      i32.const 0
      call 48812
      i32.eqz
      br_if 0 (;@1;)
      local.get 5
      local.get 0
      i32.const 0
      call 20479
      local.get 5
      local.get 5
      i32.load
      local.tee 0
      i32.load offset=556
      local.get 0
      i32.load offset=552
      call_indirect (type 1)
    end
    local.get 4
    i32.const 16
    i32.add
    global.set 0)
