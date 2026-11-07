  (func (;44352;) (type 21) (param i32 i32 i32 i32 i32 i32 i32 i32)
    (local f32 i64)
    global.get 0
    i32.const 32
    i32.sub
    local.tee 7
    global.set 0
    i32.const 4367376
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3356428
      call 2180
      i32.const 3386588
      call 2180
      i32.const 3386592
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3435560
      call 2180
      i32.const 3482356
      call 2180
      i32.const 4367376
      i32.const 1
      i32.store8
    end
    local.get 0
    local.get 1
    i32.store offset=80
    local.get 0
    local.get 1
    i32.load offset=8
    i32.store offset=56
    local.get 0
    local.get 1
    i32.load offset=12
    i32.store offset=60
    local.get 0
    local.get 1
    i32.load offset=16
    i32.store offset=72
    local.get 0
    local.get 1
    i32.load offset=36
    i32.store offset=68
    local.get 0
    local.get 1
    i32.load offset=40
    i32.store offset=92
    local.get 1
    f32.load offset=24
    local.set 8
    local.get 0
    local.get 6
    i32.store8 offset=168
    local.get 0
    local.get 3
    i32.store offset=100
    local.get 0
    local.get 2
    i32.store offset=84
    local.get 0
    local.get 8
    f32.store offset=76
    local.get 0
    i32.load offset=40
    local.tee 3
    i32.load offset=12
    i32.const 0
    i32.gt_s
    if  ;; label = @1
      i32.const 0
      local.set 2
      loop  ;; label = @2
        local.get 3
        local.get 2
        local.get 7
        i32.const 28
        i32.add
        i32.const 3386592
        i32.load
        call 50458
        local.get 7
        i32.load offset=28
        local.set 3
        i32.const 3360788
        i32.load
        local.tee 6
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 6
          call 60460
        end
        block  ;; label = @3
          block  ;; label = @4
            local.get 3
            i32.const 0
            i32.const 0
            call 48812
            i32.eqz
            br_if 0 (;@4;)
            local.get 0
            i32.load offset=40
            local.get 2
            local.get 7
            i32.const 28
            i32.add
            i32.const 3386592
            i32.load
            call 50458
            local.get 7
            i32.load offset=28
            i32.const 0
            call 48736
            local.set 3
            i32.const 3360788
            i32.load
            local.tee 6
            i32.load offset=116
            i32.eqz
            if  ;; label = @5
              local.get 6
              call 60460
            end
            local.get 3
            i32.const 0
            i32.const 0
            call 48812
            i32.eqz
            br_if 0 (;@4;)
            local.get 0
            i32.load offset=40
            local.get 2
            local.get 7
            i32.const 28
            i32.add
            i32.const 3386592
            i32.load
            call 50458
            local.get 7
            i32.load offset=28
            i32.const 0
            call 48736
            local.get 5
            i32.const 0
            call 48830
            br 1 (;@3;)
          end
          local.get 0
          i32.const 0
          call 48736
          i32.const 0
          call 48958
          local.set 6
          local.get 0
          i32.load offset=40
          local.get 2
          local.get 7
          i32.const 28
          i32.add
          i32.const 3386592
          i32.load
          call 50458
          i32.const 3482356
          i32.load
          local.get 6
          i32.const 3435560
          i32.load
          local.get 7
          i32.load offset=28
          local.tee 6
          if (result i32)  ;; label = @4
            local.get 6
            local.get 6
            i32.load
            local.tee 3
            i32.load offset=220
            local.get 3
            i32.load offset=216
            call_indirect (type 0)
          else
            i32.const 0
          end
          i32.const 0
          call 48225
          local.set 3
          i32.const 3356428
          i32.load
          local.tee 6
          i32.load offset=116
          i32.eqz
          if  ;; label = @4
            local.get 6
            call 60460
          end
          local.get 3
          i32.const 0
          call 55817
        end
        local.get 2
        i32.const 1
        i32.add
        local.tee 2
        local.get 0
        i32.load offset=40
        local.tee 3
        i32.load offset=12
        i32.lt_s
        br_if 0 (;@2;)
      end
    end
    local.get 0
    local.get 1
    local.get 7
    call 44353
    local.get 7
    local.get 4
    i64.load align=4
    local.tee 9
    i64.store offset=8
    local.get 7
    local.get 9
    i64.store offset=16
    local.get 0
    local.get 7
    i32.const 8
    i32.add
    local.get 7
    call 44354
    local.get 0
    i32.load offset=48
    local.tee 2
    if  ;; label = @1
      local.get 2
      local.get 0
      i32.load offset=72
      local.get 0
      i32.load offset=84
      i32.const 0
      call 40996
    end
    local.get 0
    i32.load offset=72
    local.set 2
    local.get 0
    i32.const 0
    call 48736
    local.get 2
    i32.const 3
    i32.ne
    i32.const 0
    call 48833
    local.get 0
    i32.load8_u offset=168
    if  ;; label = @1
      local.get 0
      i32.load offset=188
      local.tee 2
      if  ;; label = @2
        local.get 0
        local.get 2
        i32.const 0
        call 48892
        local.get 0
        i32.const 0
        i32.store offset=188
      end
      i32.const 4367397
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3367760
        call 2180
        i32.const 4367397
        i32.const 1
        i32.store8
      end
      i32.const 3367760
      i32.load
      call 1900
      local.tee 2
      local.get 0
      i32.store offset=16
      local.get 2
      i32.const 0
      i32.store offset=8
      local.get 0
      local.get 0
      local.get 2
      i32.const 0
      call 48887
      i32.store offset=188
    end
    local.get 7
    i32.const 32
    i32.add
    global.set 0)
