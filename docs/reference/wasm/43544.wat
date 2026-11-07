  (func (;43544;) (type 2) (param i32 i32 i32)
    (local i32 i32 f32 f32 i64 i64)
    global.get 0
    i32.const 96
    i32.sub
    local.tee 2
    global.set 0
    i32.const 4366819
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3360788
      call 2180
      i32.const 3361776
      call 2180
      i32.const 4366819
      i32.const 1
      i32.store8
    end
    i32.const 3360788
    i32.load
    local.tee 3
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 3
      call 60460
    end
    block  ;; label = @1
      local.get 1
      i32.const 0
      i32.const 0
      call 48872
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=36
      local.set 3
      i32.const 3360788
      i32.load
      local.tee 4
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 4
        call 60460
      end
      local.get 3
      i32.const 0
      i32.const 0
      call 48872
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=40
      local.set 4
      i32.const 3360788
      i32.load
      local.tee 3
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 3
        call 60460
      end
      i32.const 0
      local.set 3
      local.get 4
      i32.const 0
      i32.const 0
      call 48872
      br_if 0 (;@1;)
      local.get 1
      i32.const 0
      call 48828
      local.tee 1
      if  ;; label = @2
        local.get 1
        i32.const 0
        local.get 1
        i32.load
        i32.const 3361776
        i32.load
        i32.eq
        select
        local.set 3
      end
      i32.const 0
      local.set 1
      local.get 0
      i32.load offset=36
      i32.const 0
      call 48828
      local.tee 0
      if  ;; label = @2
        local.get 0
        i32.const 0
        local.get 0
        i32.load
        i32.const 3361776
        i32.load
        i32.eq
        select
        local.set 1
      end
      i32.const 3360788
      i32.load
      local.tee 0
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 0
        call 60460
      end
      local.get 3
      i32.const 0
      i32.const 0
      call 48872
      br_if 0 (;@1;)
      i32.const 3360788
      i32.load
      local.tee 0
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 0
        call 60460
      end
      local.get 1
      i32.const 0
      i32.const 0
      call 48872
      br_if 0 (;@1;)
      local.get 3
      i32.const 0
      i32.const 0
      call 7821
      drop
      local.get 3
      local.get 1
      i32.const 0
      i32.const 0
      call 49498
      local.get 2
      i32.const 80
      i32.add
      local.get 1
      i32.const 0
      call 49428
      local.get 2
      f32.load offset=88
      local.set 5
      local.get 2
      i32.const 80
      i32.add
      local.get 1
      i32.const 0
      call 49428
      local.get 2
      f32.load offset=92
      local.set 6
      local.get 5
      f32.const 0x1p-1 (;=0.5;)
      f32.mul
      local.tee 5
      f32.const -0x1.4p+1 (;=-2.5;)
      f32.div
      local.get 5
      f32.const 0x1.4p+1 (;=2.5;)
      f32.div
      i32.const 0
      call 48613
      local.set 5
      local.get 2
      local.get 6
      f32.const 0x1p-1 (;=0.5;)
      f32.mul
      local.tee 6
      f32.const -0x1p-2 (;=-0.25;)
      f32.mul
      local.get 6
      f32.const 0x1p-1 (;=0.5;)
      f32.mul
      i32.const 0
      call 48613
      f32.store offset=76
      local.get 2
      local.get 5
      f32.store offset=72
      local.get 2
      local.get 2
      i64.load offset=72
      i64.store offset=32
      local.get 3
      local.get 2
      i32.const 32
      i32.add
      i32.const 0
      call 49438
      i32.const 4377531
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3364792
        call 2180
        i32.const 4377531
        i32.const 1
        i32.store8
      end
      i32.const 3364792
      i32.load
      i32.load offset=92
      local.tee 1
      f32.load offset=12
      local.set 5
      local.get 1
      f32.load offset=16
      local.set 6
      local.get 2
      i32.const -64
      i32.sub
      local.tee 0
      local.get 1
      f32.load offset=20
      f32.const 0x1.99999ap-1 (;=0.8;)
      f32.mul
      f32.store
      local.get 2
      local.get 0
      i32.load
      i32.store offset=24
      local.get 2
      local.get 6
      f32.const 0x1.99999ap-1 (;=0.8;)
      f32.mul
      f32.store offset=60
      local.get 2
      local.get 5
      f32.const 0x1.99999ap-1 (;=0.8;)
      f32.mul
      f32.store offset=56
      local.get 2
      local.get 2
      i64.load offset=56
      i64.store offset=16
      local.get 3
      local.get 2
      i32.const 16
      i32.add
      i32.const 0
      call 49495
      i32.const 4377529
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3361564
        call 2180
        i32.const 4377529
        i32.const 1
        i32.store8
      end
      i32.const 3361564
      i32.load
      i32.load offset=92
      local.tee 1
      i64.load align=4
      local.set 7
      local.get 2
      local.get 1
      i64.load offset=8 align=4
      local.tee 8
      i64.store offset=8
      local.get 2
      local.get 8
      i64.store offset=48
      local.get 2
      local.get 7
      i64.store offset=40
      local.get 2
      local.get 7
      i64.store
      local.get 3
      local.get 2
      i32.const 0
      call 49482
    end
    local.get 2
    i32.const 96
    i32.add
    global.set 0)
